import { Lead } from './types';
import { calculateScore, getSegmentation } from './scoring';

export interface ScoreRule {
    value: string;
    score: number;
    matchType: 'equals' | 'contains';
}

export interface ColumnMapping {
    rowIndex: number; // The index of the column in the sheet (0, 1, 2...)
    headerName: string; // The text in the header row
    targetField: keyof Lead | 'ignore'; // The internal field it maps to
    scoreRules?: ScoreRule[]; // Points configuration
}

export interface SegmentationConfig {
    superQualified: number;
    qualified: number;
}

export interface GoogleSheetConfig {
    id: string;
    name: string; // Launch Name
    spreadsheetId: string;
    sheetName: string;
    accessToken?: string;
    mappings?: ColumnMapping[];
    segmentation?: SegmentationConfig;
}

import * as XLSX from 'xlsx';

export const fetchGoogleSheetData = async (config: GoogleSheetConfig): Promise<string[][]> => {
    // If we have a token, use the API (more reliable for private sheets)
    if (config.accessToken) {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${config.sheetName}?majorDimension=ROWS`,
            {
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                },
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || `Error fetching sheet: ${response.statusText}`);
        }

        const data = await response.json();
        return data.values || [];
    }

    // Try to fetch as public CSV
    try {
        const response = await fetch(
            `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(config.sheetName)}`
        );

        if (!response.ok) {
            throw new Error("Could not access public sheet. Please provide an access token or make the sheet public.");
        }

        const csvText = await response.text();
        const workbook = XLSX.read(csvText, { type: 'string' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        return jsonData;
    } catch (error: any) {
        console.error("CSV fetch error:", error);
        throw new Error("Failed to access sheet. If it is private, please provide an Access Token.");
    }
};

const parseDate = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString();

    // Try standard ISO parsing first
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) return isoDate.toISOString();

    // Try parsing "dd/mm/yyyy HH:mm:ss" format (common in Google Sheets PT-BR)
    const ptBrMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2}):(\d{1,2}))?$/);
    if (ptBrMatch) {
        const [_, day, month, year, hour = '0', minute = '0', second = '0'] = ptBrMatch;
        return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second)
        ).toISOString();
    }

    return new Date().toISOString(); // Fallback
};

export const parseSheetData = (data: string[][], config?: GoogleSheetConfig): Lead[] => {
    // Assuming the first row is header, skip it
    const rows = data.slice(1);

    return rows.map((row, index) => {
        // Default base
        let lead: Partial<Lead> = {
            id: `sheet-${index}`,
            timestamp: new Date().toISOString(),
        };
        let score = 0;

        // Dynamic Mapping Path
        if (config?.mappings && config.mappings.length > 0) {
            config.mappings.forEach(mapping => {
                if (mapping.targetField === 'ignore') return;

                const cellValue = row[mapping.rowIndex];
                if (cellValue !== undefined) {
                    // Assign to Lead field
                    (lead as any)[mapping.targetField] = cellValue;

                    // Calculate Score
                    if (mapping.scoreRules && mapping.scoreRules.length > 0) {
                        const cellValStr = String(cellValue || '').trim().toLowerCase();

                        // Find matching rule
                        const rule = mapping.scoreRules.find(r => {
                            const ruleVal = r.value.trim().toLowerCase();
                            if (r.matchType === 'contains') {
                                return cellValStr.includes(ruleVal);
                            }
                            return cellValStr === ruleVal;
                        });

                        if (rule) {
                            score += rule.score;
                        }
                    }
                }
            });

            // Parse timestamp if it was mapped
            if (lead.timestamp) {
                lead.timestamp = parseDate(lead.timestamp);
            }

        } else {
            // Legacy / Hardcoded Path (Fallback)
            lead = {
                id: `sheet-${index}`,
                timestamp: parseDate(row[0]),
                name: row[28] || row[1] || '',
                email: row[1] || '',
                age: row[2] || '',
                hasChildren: row[3] || '',
                gender: row[4] || '',
                education: row[5] || '',
                maritalStatus: row[6] || '',
                followTime: row[7] || '',
                hasStore: row[8] || '',
                storeType: row[9] || '',
                segment: row[10] || '',
                difficulty: row[11] || '',
                revenue: row[12] || '',
                storeTime: row[13] || '',
                management: row[14] || '',
                digitalPresence: row[15] || '',
                teamStructure: row[16] || '',
                sales: row[17] || '',
                dream: row[18] || '',
                isStudent: row[19] || '',
                challengeDifficulty: row[20] || '',
                question: row[21] || '',
                utm_source: row[22] || '', // Coluna W
                utm_campaign: row[23] || '', // Coluna X
                utm_medium: row[24] || '', // Coluna Y (Público)
                utm_content: row[25] || '', // Coluna Z (Criativo)
                whatsapp: row[29] || '',
            };

            score = calculateScore(lead);
        }

        return {
            ...lead,
            score,
            segmentation: getSegmentation(
                score,
                config?.segmentation?.superQualified,
                config?.segmentation?.qualified
            )
        } as Lead;
    });
};
