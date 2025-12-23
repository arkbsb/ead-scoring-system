
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead } from '@/lib/types';
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
    removeLaunch: (id: string) => void;
    selectLaunch: (id: string) => void;
    refresh: () => void;
    exportBackup: () => void;
    importBackup: (json: string) => void;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function LeadsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [launches, setLaunches] = useState<GoogleSheetConfig[]>([]);
    const [activeLaunchId, setActiveLaunchId] = useState<string | null>(null);

    const activeLaunch = launches.find(l => l.id === activeLaunchId) || null;

    // Fetch initial data (Sources & Settings)
    useEffect(() => {
        if (user) {
            fetchInitialData();
        } else {
            setLaunches([]);
            setActiveLaunchId(null);
            setLeads([]);
        }
    }, [user]);

    // Fetch Leads when active source changes
    useEffect(() => {
        if (activeLaunch) {
            fetchLeads(activeLaunch);
        } else {
            setLeads([]);
        }
    }, [activeLaunch]);

    const fetchInitialData = async () => {
        if (!user) return;
        setLoading(true);
        console.log("fetching initial data for user:", user.id);
        try {
            // 1. Fetch Lead Sources
            const { data: sourcesData, error: sourcesError } = await supabase
                .from('lead_sources')
                .select('*')
                .order('created_at', { ascending: false });

            if (sourcesError) {
                console.error("Error fetching lead_sources:", sourcesError);
                throw sourcesError;
            }
            console.log("lead_sources fetched:", sourcesData?.length);

            const mappedSources: GoogleSheetConfig[] = sourcesData.map(row => ({
                id: row.id,
                name: row.name,
                spreadsheetId: row.spreadsheet_id,
                sheetName: row.tab_name, // Map DB 'tab_name' to Interface 'sheetName'
                mappings: row.mapping // Map DB 'mapping' to Interface 'mappings'
            }));
            setLaunches(mappedSources);
            saveBackup(mappedSources); // Auto-backup on fetch

            // 2. Fetch User Settings for Active Source
            const { data: settingsData, error: settingsError } = await supabase
                .from('user_settings')
                .select('active_lead_source_id')
                .eq('user_id', user.id)
                .single();

            console.log("user_settings fetched:", settingsData, settingsError);

            if (!settingsError && settingsData?.active_lead_source_id) {
                // Verify if the active source still exists
                if (mappedSources.find(s => s.id === settingsData.active_lead_source_id)) {
                    console.log("Setting active launch from DB:", settingsData.active_lead_source_id);
                    setActiveLaunchId(settingsData.active_lead_source_id);
                } else {
                    console.warn("Saved active launch ID not found in sources:", settingsData.active_lead_source_id);
                }
            } else if (mappedSources.length > 0) {
                // Default to first if no setting
                console.log("Defaulting to first launch:", mappedSources[0].id);
                setActiveLaunchId(mappedSources[0].id);
            }

        } catch (err: any) {
            console.error('Error fetching initial data:', err);
            setError(`Erro ao carregar configurações: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeads = async (config: GoogleSheetConfig) => {
        setLoading(true);
        setError(null);
        try {
            // Use sheetName as per interface
            const rawData = await fetchGoogleSheetData(config);
            const parsedLeads = parseSheetData(rawData, config);
            setLeads(parsedLeads);
        } catch (err: any) {
            console.error("Failed to fetch leads", err);
            setError(err.message || "Falha ao carregar leads.");
        } finally {
            setLoading(false);
        }
    };

    const addLaunch = async (config: GoogleSheetConfig) => {
        if (!user) return;
        try {
            const dbPayload = {
                user_id: user.id,
                name: config.name,
                spreadsheet_id: config.spreadsheetId,
                tab_name: config.sheetName, // DB column is tab_name
                mapping: config.mappings // DB column is mapping
            };

            const { error } = await supabase
                .from('lead_sources')
                .insert(dbPayload)
                .select()
                .single();

            if (error) throw error;

            // Re-fetch to normalize
            await fetchInitialData();

        } catch (err: any) {
            console.error("Error adding lead source:", err);
            setError("Failed to add source: " + err.message);
        }
    };

    const updateLaunch = async (config: GoogleSheetConfig) => {
        if (!user) return;
        try {
            const dbPayload = {
                name: config.name,
                spreadsheet_id: config.spreadsheetId,
                tab_name: config.sheetName,
                mapping: config.mappings
            };

            const { error } = await supabase
                .from('lead_sources')
                .update(dbPayload)
                .eq('id', config.id);

            if (error) throw error;

            // Update local state optimistic logic or re-fetch
            await fetchInitialData();

        } catch (err: any) {
            console.error("Error updating lead source:", err);
            setError("Failed to update source");
        }
    };

    const removeLaunch = async (id: string) => {
        try {
            const { error } = await supabase
                .from('lead_sources')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setLaunches(prev => prev.filter(l => l.id !== id));
            if (activeLaunchId === id) {
                setActiveLaunchId(null);
                setLeads([]);
            }
        } catch (err: any) {
            console.error("Error deleting lead source:", err);
            setError("Failed to delete source");
        }
    };

    const selectLaunch = async (id: string) => {
        if (!user) return;
        console.log("Selecting active launch:", id);
        setActiveLaunchId(id);

        // Persist selection
        try {
            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    active_lead_source_id: id
                }, { onConflict: 'user_id' });

            if (error) console.error("Error saving active source setting:", error);
            else console.log("Active source setting saved to DB");
        } catch (err) {
            console.error("Error saving setting:", err);
        }
    };



    // --- Safety Layer (Backup & Restore) ---

    const saveBackup = (currentLaunches: GoogleSheetConfig[]) => {
        try {
            localStorage.setItem('lead_source_backup', JSON.stringify(currentLaunches));
            console.log('Backup saved to localStorage');
        } catch (e) {
            console.error('Failed to save backup:', e);
        }
    };



    const exportBackup = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(launches, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "lead_scoring_backup_" + new Date().toISOString() + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const importBackup = (jsonContent: string) => {
        try {
            const parsed = JSON.parse(jsonContent);
            if (Array.isArray(parsed)) {
                setLaunches(parsed);
                saveBackup(parsed); // Update local backup
                // Optionally sync to DB here, but for now just safely load into state
                alert('Backup restaurado com sucesso! Clique em salvar em cada item se desejar persistir no banco.');
            } else {
                throw new Error('Formato de arquivo inválido.');
            }
        } catch (e: any) {
            setError('Falha ao importar backup: ' + e.message);
        }
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
            refresh: () => {
                const active = launches.find(l => l.id === activeLaunchId);
                if (active) fetchLeads(active);
            },
            exportBackup,
            importBackup
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

