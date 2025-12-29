import { Ad, AdSet, Campaign, TrafficMapping, ColumnMapping } from './traffic-types';
import { fetchGoogleSheetData } from './google-sheets';
import { slugify } from './utils';

// Helper to get value from row at index safely
const getVal = (row: string[], index: number | undefined): string | undefined => {
    if (index === undefined || index < 0 || index >= row.length) return undefined;
    return row[index];
};

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
    const str = String(val).replace(/\./g, '').replace(',', '.');
    return parseFloat(str) || 0;
};

// Helper to parse dates
const parseDate = (val: any): string => {
    if (!val) return new Date().toISOString();
    const str = String(val).trim();
    const brDateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/;
    const match = str.match(brDateRegex);

    if (match) {
        const [_, day, month, year] = match;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toISOString();
    }

    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const parseCustomFields = (row: string[], mapping: ColumnMapping) => {
    const custom: Record<string, any> = {};
    mapping.customFields?.forEach(cf => {
        const raw = getVal(row, cf.index);
        const num = parseNumber(raw);
        custom[cf.key] = isNaN(num) || raw === '' ? raw : num;
    });
    return custom;
};

export function parseCampaigns(rows: string[][], mapping: ColumnMapping): Campaign[] {
    return rows.slice(1).map((row, idx) => {
        const name = getVal(row, mapping.nameIndex) || `Campaign ${idx + 1}`;
        const spend = parseCurrency(getVal(row, mapping.spendIndex));
        const impressions = parseNumber(getVal(row, mapping.impressionsIndex));
        const clicks = parseNumber(getVal(row, mapping.clicksIndex));
        const linkClicks = parseNumber(getVal(row, mapping.linkClicksIndex));
        const pageViews = parseNumber(getVal(row, mapping.pageViewsIndex));
        const leads = parseNumber(getVal(row, mapping.leadsIndex));

        return {
            id: `cmp-${slugify(name)}`,
            name: name,
            status: 'active',
            objective: 'TRAFFIC',
            startDate: parseDate(getVal(row, 0)),
            impressions,
            clicks,
            linkClicks,
            pageViews,
            spend,
            leads,
            organicLeads: parseNumber(getVal(row, mapping.organicLeadsIndex)),
            hotLeads: parseNumber(getVal(row, mapping.hotLeadsIndex)),
            coldLeads: parseNumber(getVal(row, mapping.coldLeadsIndex)),
            bestLandingPage: getVal(row, mapping.bestLandingPageIndex) || '',
            bestLandingPageLeads: parseNumber(getVal(row, mapping.bestLandingPageLeadsIndex)),
            leads1a1: parseNumber(getVal(row, mapping.leads1a1Index)),
            mandouMsgApi: parseNumber(getVal(row, mapping.mandouMsgApiIndex)),
            respondeuPesquisa: parseNumber(getVal(row, mapping.respondeuPesquisaIndex)),
            leadsGruposLegados: parseNumber(getVal(row, mapping.leadsGruposLegadosIndex)),
            rawTotalLeads: parseNumber(getVal(row, 21)),
            reach: parseNumber(getVal(row, mapping.reachIndex)),
            ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
            cpc: clicks > 0 ? spend / clicks : 0,
            cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
            cpl: leads > 0 ? spend / leads : 0,
            conversions: 0,
            engagement: 0,
            ...parseCustomFields(row, mapping)
        };
    });
}

export class TrafficSheetParser {
    static async fetchAndParse(spreadsheetId: string, mapping: TrafficMapping, accessToken?: string) {
        try {
            const [campaignsData, adSetsData, adsData] = await Promise.all([
                fetchGoogleSheetData({ id: 'c', name: 'c', spreadsheetId, sheetName: mapping.campaigns.sheetName, accessToken }),
                fetchGoogleSheetData({ id: 'as', name: 'as', spreadsheetId, sheetName: mapping.adSets.sheetName, accessToken }),
                fetchGoogleSheetData({ id: 'a', name: 'a', spreadsheetId, sheetName: mapping.ads.sheetName, accessToken })
            ]);

            return {
                campaigns: parseCampaigns(campaignsData, mapping.campaigns.mapping),
                adSets: this.parseAdSets(adSetsData, mapping.adSets.mapping),
                ads: this.parseAds(adsData, mapping.ads.mapping)
            };
        } catch (error) {
            console.error("Error fetching traffic data:", error);
            throw error;
        }
    }

    private static parseAdSets(rows: string[][], mapping: ColumnMapping): AdSet[] {
        return rows.slice(1).map((row, idx) => {
            const name = getVal(row, mapping.nameIndex) || `AdSet ${idx + 1}`;
            const spend = parseCurrency(getVal(row, mapping.spendIndex));
            const impressions = parseNumber(getVal(row, mapping.impressionsIndex));
            const clicks = parseNumber(getVal(row, mapping.clicksIndex));
            const linkClicks = parseNumber(getVal(row, mapping.linkClicksIndex));
            const pageViews = parseNumber(getVal(row, mapping.pageViewsIndex));
            const leads = parseNumber(getVal(row, mapping.leadsIndex));

            return {
                id: `as-${idx}`,
                campaignId: 'unknown',
                name,
                status: 'active',
                segmentation: 'General',
                startDate: parseDate(getVal(row, 0)),
                impressions,
                clicks,
                linkClicks,
                pageViews,
                spend,
                leads,
                reach: parseNumber(getVal(row, mapping.reachIndex)),
                ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
                cpc: clicks > 0 ? spend / clicks : 0,
                cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
                cpl: leads > 0 ? spend / leads : 0,
                conversions: 0,
                engagement: 0,
                ...parseCustomFields(row, mapping)
            };
        });
    }

    private static parseAds(rows: string[][], mapping: ColumnMapping): Ad[] {
        return rows.slice(1).map((row, idx) => {
            const name = getVal(row, mapping.nameIndex) || `Ad ${idx + 1}`;
            const spend = parseCurrency(getVal(row, mapping.spendIndex));
            const impressions = parseNumber(getVal(row, mapping.impressionsIndex));
            const clicks = parseNumber(getVal(row, mapping.clicksIndex));
            const linkClicks = parseNumber(getVal(row, mapping.linkClicksIndex));
            const pageViews = parseNumber(getVal(row, mapping.pageViewsIndex));
            const leads = parseNumber(getVal(row, mapping.leadsIndex));

            return {
                id: `ad-${idx}`,
                adSetId: 'unknown',
                campaignId: 'unknown',
                name,
                status: 'active',
                format: 'IMAGE',
                startDate: parseDate(getVal(row, 0)),
                impressions,
                clicks,
                linkClicks,
                pageViews,
                spend,
                leads,
                reach: parseNumber(getVal(row, mapping.reachIndex)),
                ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
                cpc: clicks > 0 ? spend / clicks : 0,
                cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
                cpl: leads > 0 ? spend / leads : 0,
                conversions: 0,
                engagement: 0,
                ...parseCustomFields(row, mapping)
            };
        });
    }
}
