import { Ad, AdSet, Campaign } from './traffic-types';
import { fetchGoogleSheetData } from './google-sheets';

// Helper to parse currency strings "R$ 1.200,50" -> 1200.50
const parseCurrency = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const str = String(val).replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(str) || 0;
};

// Helper to parse numbers "1.200" -> 1200
const parseNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const str = String(val).replace(/\./g, '').replace(',', '.'); // Assuming PT-BR "1.000" = 1000
    return parseFloat(str) || 0;
};

// Helper to parse dates "DD/MM/YYYY HH:mm:ss" or ISO
const parseDate = (val: any): string => {
    if (!val) return new Date().toISOString();
    const str = String(val).trim();

    // Check for DD/MM/YYYY
    const brDateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/;
    const match = str.match(brDateRegex);

    if (match) {
        const [_, day, month, year] = match;
        // month is 0-indexed in JS Date
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toISOString();
    }

    // Fallback to native parsing
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

// Export parseCampaigns as a public function for use in other modules
export function parseCampaigns(rows: string[][]): Campaign[] {
    // Expected: Data e Hora | Nome da Campanha | Valor gasto | impressões | clicks | cpc | cpm | ctr | alcance | visualização página | Lead
    // Index:        0       |         1        |      2      |      3     |    4   |  5  |  6  |  7  |    8    |          9          |  11
    // We assume headers are row 0, data starts row 1

    return rows.slice(1).map((row, idx) => {
        const name = row[1] || `Campaign ${idx + 1}`;
        const spend = parseCurrency(row[2]);
        const impressions = parseNumber(row[3]);
        const clicks = parseNumber(row[4]);
        const linkClicks = parseNumber(row[9]); // Column J
        const pageViews = parseNumber(row[10]); // Column K
        const leads = parseNumber(row[11]); // Column L
        const organicLeads = parseNumber(row[12]); // Column M - Organic Leads
        const hotLeads = parseNumber(row[13]); // Column N - Hot Leads
        const coldLeads = parseNumber(row[14]); // Column O - Cold Leads
        const bestLandingPage = row[15] || ''; // Column P - Best Landing Page
        const bestLandingPageLeads = parseNumber(row[16]); // Column Q - Leads from Best LP
        const leads1a1 = parseNumber(row[17]); // Column R
        const mandouMsgApi = parseNumber(row[18]); // Column S
        const respondeuPesquisa = parseNumber(row[19]); // Column T

        // Recalculate derived metrics to ensure consistency
        return {
            id: `cmp-${idx}`, // In lack of a real ID
            name: name,
            status: 'active', // Default as not provided in columns
            objective: 'TRAFFIC', // Default
            startDate: parseDate(row[0]),
            impressions,
            clicks,
            linkClicks,
            pageViews,
            spend,
            leads,
            organicLeads,
            hotLeads,
            coldLeads,
            bestLandingPage,
            bestLandingPageLeads,
            leads1a1,
            mandouMsgApi,
            respondeuPesquisa,
            reach: parseNumber(row[8]),
            ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
            cpc: clicks > 0 ? spend / clicks : 0,
            cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
            cpl: leads > 0 ? spend / leads : 0,
            conversions: 0, // Not in columns
            engagement: 0   // Not in columns
        };
    });
}

export class TrafficSheetParser {

    static async fetchAndParse(spreadsheetId: string, accessToken?: string) {
        // We need to fetch 3 tabs. Assuming standardized names or user config.
        // User said: "Campanhas", "Conjunto de Ads", "Anúncios"

        try {
            const [campaignsData, adSetsData, adsData] = await Promise.all([
                fetchGoogleSheetData({ id: 'c', name: 'c', spreadsheetId, sheetName: 'Campanhas', accessToken }),
                fetchGoogleSheetData({ id: 'as', name: 'as', spreadsheetId, sheetName: 'Conjunto de Ads', accessToken }),
                fetchGoogleSheetData({ id: 'a', name: 'a', spreadsheetId, sheetName: 'Anúncios', accessToken })
            ]);

            return {
                campaigns: parseCampaigns(campaignsData),
                adSets: this.parseAdSets(adSetsData),
                ads: this.parseAds(adsData)
            };
        } catch (error) {
            console.error("Error fetching traffic data:", error);
            throw error;
        }
    }

    private static parseAdSets(rows: string[][]): AdSet[] {
        // Expected: Data e Hora | Nome do Conjunto | Valor gasto | ...

        return rows.slice(1).map((row, idx) => {
            const name = row[1] || `AdSet ${idx + 1}`;
            // Try to extract Campaign Name from AdSet name if common pattern "Campaign - Adset" exists
            // Or default to first campaign? For now, leave orphaned.

            const spend = parseCurrency(row[2]);
            const impressions = parseNumber(row[3]);
            const clicks = parseNumber(row[4]);
            const linkClicks = parseNumber(row[9]);
            const pageViews = parseNumber(row[10]);
            const leads = parseNumber(row[11]);

            return {
                id: `as-${idx}`,
                campaignId: 'unknown', // Critical missing link
                name,
                status: 'active',
                segmentation: 'General',
                startDate: parseDate(row[0]),
                impressions,
                clicks,
                linkClicks,
                pageViews,
                spend,
                leads,
                reach: parseNumber(row[8]),
                ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
                cpc: clicks > 0 ? spend / clicks : 0,
                cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
                cpl: leads > 0 ? spend / leads : 0,
                conversions: 0,
                engagement: 0
            };
        });
    }

    private static parseAds(rows: string[][]): Ad[] {
        // Expected: Data e Hora | Nome do Criativo | Valor gasto | ...

        return rows.slice(1).map((row, idx) => {
            const name = row[1] || `Ad ${idx + 1}`;
            const spend = parseCurrency(row[2]);
            const impressions = parseNumber(row[3]);
            const clicks = parseNumber(row[4]);
            const linkClicks = parseNumber(row[9]);
            const pageViews = parseNumber(row[10]);
            const leads = parseNumber(row[11]);

            return {
                id: `ad-${idx}`,
                adSetId: 'unknown',
                campaignId: 'unknown',
                name,
                status: 'active',
                format: 'IMAGE', // Default
                startDate: parseDate(row[0]),
                impressions,
                clicks,
                linkClicks,
                pageViews,
                spend,
                leads,
                reach: parseNumber(row[8]),
                ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
                cpc: clicks > 0 ? spend / clicks : 0,
                cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
                cpl: leads > 0 ? spend / leads : 0,
                conversions: 0,
                engagement: 0
            };
        });
    }
}
