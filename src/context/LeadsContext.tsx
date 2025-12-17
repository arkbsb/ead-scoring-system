import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead } from '@/lib/types';
import { generateMockLeads } from '@/lib/mock-data';
import { fetchGoogleSheetData, parseSheetData, GoogleSheetConfig } from '@/lib/google-sheets';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface LeadsContextType {
    leads: Lead[];
    loading: boolean;
    error: string | null;
    launches: GoogleSheetConfig[];
    activeLaunchId: string | null;
    activeLaunch: GoogleSheetConfig | null;
    addLaunch: (config: GoogleSheetConfig) => Promise<void>;
    updateLaunch: (config: GoogleSheetConfig) => Promise<void>;
    removeLaunch: (id: string) => Promise<void>;
    selectLaunch: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function LeadsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [launches, setLaunches] = useState<GoogleSheetConfig[]>([]);

    const [activeLaunchId, setActiveLaunchId] = useState<string | null>(() => {
        return localStorage.getItem('activeLaunchId');
    });

    const activeLaunch = launches.find(l => l.id === activeLaunchId) || null;

    // Fetch launches from Supabase when user logs in
    useEffect(() => {
        if (user) {
            fetchLaunches();
        } else {
            // Fallback to local storage if not logged in (or clear it)
            const saved = localStorage.getItem('launches');
            setLaunches(saved ? JSON.parse(saved) : []);
        }
    }, [user]);

    const fetchLaunches = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('launches')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching launches:', error);
            return;
        }

        // Map snake_case DB fields to camelCase TS interface if needed
        // Assuming DB columns are: id, name, spreadsheet_id, sheet_name, access_token
        const mappedLaunches: GoogleSheetConfig[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            spreadsheetId: item.spreadsheet_id,
            sheetName: item.sheet_name,
            accessToken: item.access_token,
            mappings: item.mappings // Load mappings from DB
        }));

        setLaunches(mappedLaunches);
    };

    useEffect(() => {
        if (activeLaunchId) {
            localStorage.setItem('activeLaunchId', activeLaunchId);
            refresh();
        } else {
            localStorage.removeItem('activeLaunchId');
            setLeads(generateMockLeads(50));
        }
    }, [activeLaunchId, launches]);

    const refresh = async () => {
        const currentLaunch = launches.find(l => l.id === activeLaunchId);
        if (!currentLaunch) return;

        setLoading(true);
        setError(null);
        try {
            const data = await fetchGoogleSheetData(currentLaunch);
            // Pass the configuration to the parser
            const parsed = parseSheetData(data, currentLaunch);
            setLeads(parsed);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to fetch data');
            if (leads.length === 0) {
                setLeads(generateMockLeads(50));
                setError(`Connection failed (${err.message}). Using mock data.`);
            }
        } finally {
            setLoading(false);
        }
    };

    const addLaunch = async (config: GoogleSheetConfig) => {
        if (user) {
            const { error } = await supabase.from('launches').insert({
                id: config.id,
                user_id: user.id,
                name: config.name,
                spreadsheet_id: config.spreadsheetId,
                sheet_name: config.sheetName,
                access_token: config.accessToken,
                mappings: config.mappings // Save mappings
            });

            if (error) {
                console.error('Error adding launch:', error);
                setError('Failed to save launch to cloud');
                return;
            }
            await fetchLaunches();
        } else {
            const newLaunches = [...launches, config];
            setLaunches(newLaunches);
            localStorage.setItem('launches', JSON.stringify(newLaunches));
        }

        if (!activeLaunchId) {
            selectLaunch(config.id);
        }
    };

    const updateLaunch = async (config: GoogleSheetConfig) => {
        if (user) {
            const { error } = await supabase.from('launches').update({
                name: config.name,
                spreadsheet_id: config.spreadsheetId,
                sheet_name: config.sheetName,
                access_token: config.accessToken,
                mappings: config.mappings // Save mappings
            }).eq('id', config.id);

            if (error) {
                console.error('Error updating launch:', error);
                setError('Failed to update launch in cloud');
                return;
            }
            await fetchLaunches();
        } else {
            const newLaunches = launches.map(l => l.id === config.id ? config : l);
            setLaunches(newLaunches);
            localStorage.setItem('launches', JSON.stringify(newLaunches));
        }

        if (activeLaunchId === config.id) {
            refresh();
        }
    };

    const removeLaunch = async (id: string) => {
        if (user) {
            const { error } = await supabase.from('launches').delete().eq('id', id);
            if (error) {
                console.error('Error deleting launch:', error);
                setError('Failed to delete launch from cloud');
                return;
            }
            await fetchLaunches();
        } else {
            const newLaunches = launches.filter(l => l.id !== id);
            setLaunches(newLaunches);
            localStorage.setItem('launches', JSON.stringify(newLaunches));
        }

        if (activeLaunchId === id) {
            setActiveLaunchId(null);
            setLeads(generateMockLeads(50));
        }
    };

    const selectLaunch = async (id: string) => {
        setActiveLaunchId(id);
    };

    return (
        <LeadsContext.Provider value={{
            leads,
            loading,
            error,
            launches,
            activeLaunchId,
            activeLaunch,
            addLaunch,
            updateLaunch,
            removeLaunch,
            selectLaunch,
            refresh
        }}>
            {children}
        </LeadsContext.Provider>
    );
}

export const useLeads = () => {
    const context = useContext(LeadsContext);
    if (context === undefined) {
        throw new Error('useLeads must be used within a LeadsProvider');
    }
    return context;
};
