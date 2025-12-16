import { Lead } from './types';
import { calculateScore, getSegmentation } from './scoring';

export interface GoogleSheetConfig {
    id: string;
    name: string; // Launch Name
    spreadsheetId: string;
    sheetName: string;
    accessToken?: string;
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

export const parseSheetData = (data: string[][]): Lead[] => {
    // Assuming the first row is header, skip it
    const rows = data.slice(1);

    return rows.map((row, index) => {
        // Map columns based on the fixed structure provided in requirements
        // 1. Nome/Email, 2. Timestamp, 3. Idade, ...
        const lead: Partial<Lead> = {
            id: `sheet-${index}`,
            timestamp: parseDate(row[0]), // Parse the timestamp safely
            name: row[1] || '',      // Column B is usually Name/Email
            email: row[1] || '',     // Map email to same column
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
            whatsapp: row[28] || '', // Column AC
            utm_source: row[22] || '', // Column W
        };

        const score = calculateScore(lead);

        return {
            ...lead,
            score,
            segmentation: getSegmentation(score)
        } as Lead;
    });
};
