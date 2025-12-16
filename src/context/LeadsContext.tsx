import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead } from '@/lib/types';
import { generateMockLeads } from '@/lib/mock-data';
import { fetchGoogleSheetData, parseSheetData, GoogleSheetConfig } from '@/lib/google-sheets';

interface LeadsContextType {
    leads: Lead[];
    loading: boolean;
    error: string | null;
    launches: GoogleSheetConfig[];
    activeLaunchId: string | null;
    activeLaunch: GoogleSheetConfig | null;
    addLaunch: (config: GoogleSheetConfig) => void;
    updateLaunch: (config: GoogleSheetConfig) => void;
    removeLaunch: (id: string) => void;
    selectLaunch: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function LeadsProvider({ children }: { children: React.ReactNode }) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [launches, setLaunches] = useState<GoogleSheetConfig[]>(() => {
        const saved = localStorage.getItem('launches');
        return saved ? JSON.parse(saved) : [];
    });

    const [activeLaunchId, setActiveLaunchId] = useState<string | null>(() => {
        return localStorage.getItem('activeLaunchId');
    });

    const activeLaunch = launches.find(l => l.id === activeLaunchId) || null;

    useEffect(() => {
        localStorage.setItem('launches', JSON.stringify(launches));
    }, [launches]);

    useEffect(() => {
        if (activeLaunchId) {
            localStorage.setItem('activeLaunchId', activeLaunchId);
            refresh();
        } else {
            localStorage.removeItem('activeLaunchId');
            setLeads(generateMockLeads(50));
        }
    }, [activeLaunchId]);

    const refresh = async () => {
        const currentLaunch = launches.find(l => l.id === activeLaunchId);
        if (!currentLaunch) return;

        setLoading(true);
        setError(null);
        try {
            const data = await fetchGoogleSheetData(currentLaunch);
            const parsed = parseSheetData(data);
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

    const addLaunch = (config: GoogleSheetConfig) => {
        setLaunches(prev => [...prev, config]);
        if (!activeLaunchId) {
            selectLaunch(config.id);
        }
    };

    const updateLaunch = (config: GoogleSheetConfig) => {
        setLaunches(prev => prev.map(l => l.id === config.id ? config : l));
        if (activeLaunchId === config.id) {
            refresh();
        }
    };

    const removeLaunch = (id: string) => {
        setLaunches(prev => prev.filter(l => l.id !== id));
        if (activeLaunchId === id) {
            setActiveLaunchId(null);
            setLeads(generateMockLeads(50));
        }
    };

    const selectLaunch = async (id: string) => {
        setActiveLaunchId(id);
        // refresh is triggered by useEffect
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
