import React, { createContext, useContext, useState, useEffect } from 'react';
import { Launch } from '@/lib/launch-types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface LaunchContextType {
    launches: Launch[];
    loading: boolean;
    error: string | null;
    addLaunch: (launch: Omit<Launch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateLaunch: (id: string, updates: Partial<Launch>) => Promise<void>;
    deleteLaunch: (id: string) => Promise<void>;
    getLaunchById: (id: string) => Launch | undefined;
}

const LaunchContext = createContext<LaunchContextType | undefined>(undefined);

export function LaunchProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [launches, setLaunches] = useState<Launch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial Load from Supabase
    useEffect(() => {
        if (user) {
            fetchLaunches();
        } else {
            setLaunches([]);
            setLoading(false);
        }
    }, [user]);

    const fetchLaunches = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('launches')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map snake_case DB to camelCase Model
            const parsedLaunches: Launch[] = (data || []).map(row => ({
                id: row.id,
                name: row.name,
                description: row.description,
                type: row.type,
                status: row.status,
                startDate: row.start_date,
                endDate: row.end_date,
                totalBudget: Number(row.total_budget),
                leadGoal: Number(row.lead_goal),
                cplScenarios: row.cpl_scenarios,
                conversionGoal: row.conversion_goals?.goal,
                averageTicket: row.conversion_goals?.ticket,
                linkedCampaignIds: row.linked_campaign_ids || [],
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }));

            setLaunches(parsedLaunches);
        } catch (err: any) {
            console.error('Error fetching launches:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addLaunch = async (launchData: Omit<Launch, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!user) {
            console.error("Attempted to add launch without user");
            setError("Usuário não autenticado.");
            return;
        }
        try {
            // Map camelCase Model to snake_case DB
            const dbPayload = {
                user_id: user.id,
                name: launchData.name,
                description: launchData.description,
                type: launchData.type,
                status: launchData.status,
                start_date: launchData.startDate,
                end_date: launchData.endDate,
                total_budget: launchData.totalBudget,
                lead_goal: launchData.leadGoal,
                cpl_scenarios: launchData.cplScenarios,
                conversion_goals: launchData.conversionGoal ? {
                    goal: launchData.conversionGoal,
                    ticket: launchData.averageTicket
                } : null,
                linked_campaign_ids: launchData.linkedCampaignIds
            };

            console.log('Sending payload to Supabase:', dbPayload);

            const { data, error } = await supabase
                .from('launches')
                .insert(dbPayload)
                .select()
                .single();

            if (error) {
                console.error('Supabase Insert Error:', error);
                throw error;
            }

            console.log('Launch saved successfully:', data);

            const newLaunch: Launch = {
                ...launchData,
                id: data.id,
                createdAt: data.created_at,
                updatedAt: data.created_at
            };

            setLaunches(prev => [newLaunch, ...prev]);
        } catch (err: any) {
            console.error('Error adding launch:', err);
            setError(err.message || 'Falha ao salvar lançamento');
            throw err;
        }
    };

    const updateLaunch = async (id: string, updates: Partial<Launch>) => {
        try {
            const dbPayload: any = {};
            if (updates.name) dbPayload.name = updates.name;
            if (updates.description) dbPayload.description = updates.description;
            if (updates.type) dbPayload.type = updates.type;
            if (updates.status) dbPayload.status = updates.status;
            if (updates.startDate) dbPayload.start_date = updates.startDate;
            if (updates.endDate) dbPayload.end_date = updates.endDate;
            if (updates.totalBudget) dbPayload.total_budget = updates.totalBudget;
            if (updates.leadGoal) dbPayload.lead_goal = updates.leadGoal;
            if (updates.cplScenarios) dbPayload.cpl_scenarios = updates.cplScenarios;
            if (updates.linkedCampaignIds) dbPayload.linked_campaign_ids = updates.linkedCampaignIds;
            if (updates.conversionGoal || updates.averageTicket) {
                // Determine current values if partial update
                const current = launches.find(l => l.id === id);
                dbPayload.conversion_goals = {
                    goal: updates.conversionGoal ?? current?.conversionGoal,
                    ticket: updates.averageTicket ?? current?.averageTicket
                };
            }
            const { error } = await supabase
                .from('launches')
                .update(dbPayload)
                .eq('id', id);

            if (error) throw error;

            setLaunches(prev => prev.map(l =>
                l.id === id ? { ...l, ...updates, updatedAt: dbPayload.updated_at } : l
            ));
        } catch (err: any) {
            console.error('Error updating launch:', err);
            throw err;
        }
    };

    const deleteLaunch = async (id: string) => {
        try {
            const { error } = await supabase
                .from('launches')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setLaunches(prev => prev.filter(l => l.id !== id));
        } catch (err: any) {
            console.error('Error deleting launch:', err);
            throw err;
        }
    };

    const getLaunchById = (id: string) => {
        return launches.find(l => l.id === id);
    };

    return (
        <LaunchContext.Provider value={{
            launches,
            loading,
            error,
            addLaunch,
            updateLaunch,
            deleteLaunch,
            getLaunchById
        }}>
            {children}
        </LaunchContext.Provider>
    );
}

export function useLaunch() {
    const context = useContext(LaunchContext);
    if (context === undefined) {
        throw new Error('useLaunch must be used within a LaunchProvider');
    }
    return context;
}
