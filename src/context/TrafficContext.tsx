
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Campaign, AdSet, Ad, TrafficFilterState, DashboardKPIs } from '@/lib/traffic-types';
import { generateMockData } from '@/lib/traffic-mock-data';
import { TrafficSheetParser } from '@/lib/traffic-integration';
import { subDays } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface TrafficContextType {
    campaigns: Campaign[];
    adSets: AdSet[];
    ads: Ad[];
    loading: boolean;
    error: string | null;
    filters: TrafficFilterState;
    setFilters: (filters: TrafficFilterState) => void;
    refreshData: () => void;

    // Sheets Integration
    spreadsheetId: string;
    setSpreadsheetId: (id: string) => Promise<void>;

    // Calculated
    filteredCampaigns: Campaign[];
    kpis: DashboardKPIs;
}

const TrafficContext = createContext<TrafficContextType | undefined>(undefined);

export function TrafficProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [data, setData] = useState<{ campaigns: Campaign[], adSets: AdSet[], ads: Ad[] }>({ campaigns: [], adSets: [], ads: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [spreadsheetId, setSpreadsheetIdState] = useState('');
    const [filters, setFilters] = useState<TrafficFilterState>({
        campaignIds: [],
        status: [],
        objective: [],
        dateRange: {
            from: subDays(new Date(), 30),
            to: new Date()
        }
    });

    // Fetch stored spreadsheet ID from Supabase
    useEffect(() => {
        const loadSettings = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('user_settings')
                    .select('traffic_spreadsheet_id')
                    .eq('user_id', user.id)
                    .single();

                if (!error && data?.traffic_spreadsheet_id) {
                    setSpreadsheetIdState(data.traffic_spreadsheet_id);
                }
            } catch (err) {
                console.error("Failed to load traffic settings:", err);
            }
        };
        loadSettings();
    }, [user]);

    const refreshData = async () => {
        setLoading(true);
        setError(null);

        try {
            const cleanId = spreadsheetId?.trim();
            if (cleanId) {
                console.log("Fetching real data for:", cleanId);
                // Clear previous data
                setData({ campaigns: [], adSets: [], ads: [] });

                // Fetch real data
                const realData = await TrafficSheetParser.fetchAndParse(cleanId);
                console.log("Parsed Data:", realData);
                setData(realData);
            } else {
                // Return to mock if no sheet ID
                setTimeout(() => {
                    const mock = generateMockData();
                    setData(mock);
                    setLoading(false);
                }, 800);
            }
        } catch (err: any) {
            console.error("Traffic Fetch Error:", err);
            setError(err.message || "Failed to fetch traffic data");
            // Fallback to mock on error to show something? Or stay empty?
            // Staying empty + showing error is better for UX debugging
        } finally {
            if (spreadsheetId && !error) {
                setLoading(false); // Only unset loading if successful or if handled above
            }
            // Ensure loading is false eventually
            if (!spreadsheetId) setLoading(false);
            else setLoading(false);
        }
    };

    // Data Fetching Logic (Real vs Mock)
    useEffect(() => {
        refreshData();
    }, [spreadsheetId]); // Re-fetch when ID changes

    const setSpreadsheetId = async (id: string) => {
        setSpreadsheetIdState(id);
        if (user) {
            try {
                // Upsert settings
                const { error } = await supabase
                    .from('user_settings')
                    .upsert({
                        user_id: user.id,
                        traffic_spreadsheet_id: id,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' });

                if (error) console.error("Error saving traffic spreadsheet ID:", error);
            } catch (err) {
                console.error("Error saving setting:", err);
            }
        }
    };

    const filteredCampaigns = useMemo(() => {
        return data.campaigns.filter(c => {
            // Status Filter
            if (filters.status.length > 0 && !filters.status.includes(c.status)) return false;
            // Objective Filter
            if (filters.objective.length > 0 && !filters.objective.includes(c.objective)) return false;
            // Search/IDs is handled mostly by UI selection, but if we had a search term:
            // if (filters.search && !c.name.includes(filters.search)) return false;
            return true;
        });
    }, [data.campaigns, filters]);

    const kpis = useMemo<DashboardKPIs>(() => {
        const initial: DashboardKPIs = {
            totalSpend: 0,
            totalLeads: 0,
            averageCpl: 0,
            connectRate: 0,
            averageCtr: 0,
            conversionRate: 0,
            cpa: 0,
            roas: 0,
            revenue: 0
        };

        const totals = filteredCampaigns.reduce((acc, curr) => {
            return {
                spend: acc.spend + curr.spend,
                leads: acc.leads + curr.leads,
                impressions: acc.impressions + curr.impressions,
                clicks: acc.clicks + curr.clicks,
                linkClicks: acc.linkClicks + (curr.linkClicks || 0),
                pageViews: acc.pageViews + (curr.pageViews || 0),
                conversions: acc.conversions + curr.conversions,
            };
        }, { spend: 0, leads: 0, impressions: 0, clicks: 0, linkClicks: 0, pageViews: 0, conversions: 0 });

        if (totals.spend === 0) return initial;

        return {
            totalSpend: totals.spend,
            totalLeads: totals.leads,
            averageCpl: totals.leads > 0 ? totals.spend / totals.leads : 0,
            averageCtr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
            // Connect Rate: Page Views / Link Clicks (Column K / Column J)
            connectRate: totals.linkClicks > 0 ? (totals.pageViews / totals.linkClicks) * 100 : 0,
            // LP Conversion Rate: Leads / Page Views (How many visitors became leads)
            conversionRate: totals.pageViews > 0 ? (totals.leads / totals.pageViews) * 100 : 0,
            cpa: totals.conversions > 0 ? totals.spend / totals.conversions : 0,
            revenue: 0, // Need revenue field in campaigns if available
            roas: 0
        };
    }, [filteredCampaigns]);

    return (
        <TrafficContext.Provider value={{
            campaigns: data.campaigns,
            adSets: data.adSets,
            ads: data.ads,
            loading,
            error,
            filters,
            setFilters,
            refreshData,
            spreadsheetId,
            setSpreadsheetId,
            filteredCampaigns,
            kpis
        }}>
            {children}
        </TrafficContext.Provider>
    );
}

export function useTraffic() {
    const context = useContext(TrafficContext);
    if (context === undefined) {
        throw new Error('useTraffic must be used within a TrafficProvider');
    }
    return context;
}
