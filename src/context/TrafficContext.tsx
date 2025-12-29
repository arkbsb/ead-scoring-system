
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
    Campaign,
    AdSet,
    Ad,
    TrafficFilterState,
    DashboardKPIs,
    DashboardConfig,
    DEFAULT_DASHBOARD_CONFIG,
    TrafficMapping,
    DEFAULT_TRAFFIC_MAPPING
} from '@/lib/traffic-types';
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

    // Config
    dashboardConfig: DashboardConfig;
    updateDashboardConfig: (config: DashboardConfig) => Promise<void>;
    trafficMapping: TrafficMapping;
    updateTrafficMapping: (mapping: TrafficMapping) => Promise<void>;
}

export const TrafficContext = createContext<TrafficContextType | undefined>(undefined);

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
    const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(DEFAULT_DASHBOARD_CONFIG);
    const [trafficMapping, setTrafficMapping] = useState<TrafficMapping>(DEFAULT_TRAFFIC_MAPPING);

    // Fetch stored spreadsheet ID from Supabase
    useEffect(() => {
        const loadSettings = async () => {
            if (!user) return;
            try {
                // 1. Try to get current user's setting
                const { data: ownData, error: ownError } = await supabase
                    .from('user_settings')
                    .select('traffic_spreadsheet_id, dashboard_config, traffic_mapping')
                    .eq('user_id', user.id)
                    .single();

                if (!ownError && ownData) {
                    if (ownData.traffic_spreadsheet_id) {
                        setSpreadsheetIdState(ownData.traffic_spreadsheet_id);
                    }
                    if (ownData.dashboard_config) {
                        setDashboardConfig(ownData.dashboard_config as DashboardConfig);
                    }
                    if (ownData.traffic_mapping) {
                        console.log('TrafficContext - Loading traffic_mapping from Supabase:', ownData.traffic_mapping);
                        setTrafficMapping(ownData.traffic_mapping as TrafficMapping);
                    } else {
                        console.log('TrafficContext - No traffic_mapping found in Supabase, using default');
                    }
                    if (ownData.traffic_spreadsheet_id) return;
                }

                // 2. Fallback: Search for any configured ID in the system (since it's a team app)
                const { data: globalData, error: globalError } = await supabase
                    .from('user_settings')
                    .select('traffic_spreadsheet_id')
                    .not('traffic_spreadsheet_id', 'is', null)
                    .order('updated_at', { ascending: false })
                    .limit(1);

                if (!globalError && globalData?.[0]?.traffic_spreadsheet_id) {
                    console.log("Using shared traffic spreadsheet ID:", globalData[0].traffic_spreadsheet_id);
                    setSpreadsheetIdState(globalData[0].traffic_spreadsheet_id);
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
                const realData = await TrafficSheetParser.fetchAndParse(cleanId, trafficMapping);
                console.log("Parsed Data:", realData);
                setData(realData);
            } else if (!user) {
                // Only show mock to unauthenticated users or if NO data exists at all
                setTimeout(() => {
                    const mock = generateMockData();
                    setData(mock);
                    setLoading(false);
                }, 800);
            } else {
                // Authenticated user with no ID and No Global Fallback found
                setData({ campaigns: [], adSets: [], ads: [] });
            }
        } catch (err: any) {
            console.error("Traffic Fetch Error:", err);
            setError(err.message || "Failed to fetch traffic data");
        } finally {
            setLoading(false);
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

    const updateDashboardConfig = async (config: DashboardConfig) => {
        setDashboardConfig(config);
        if (user) {
            try {
                const { error } = await supabase
                    .from('user_settings')
                    .upsert({
                        user_id: user.id,
                        dashboard_config: config,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' });

                if (error) console.error("Error saving dashboard config:", error);
            } catch (err) {
                console.error("Error saving dashboard config:", err);
            }
        }
    };

    const updateTrafficMapping = async (mapping: TrafficMapping) => {
        console.log('TrafficContext - updateTrafficMapping called with:', mapping);
        setTrafficMapping(mapping);
        if (user) {
            try {
                console.log('TrafficContext - Saving to Supabase for user:', user.id);
                const { error, data } = await supabase
                    .from('user_settings')
                    .upsert({
                        user_id: user.id,
                        traffic_mapping: mapping,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' });

                if (error) {
                    console.error("TrafficContext - Error saving traffic mapping:", error);
                } else {
                    console.log("TrafficContext - Successfully saved traffic mapping:", data);
                }
            } catch (err) {
                console.error("TrafficContext - Exception saving traffic mapping:", err);
            }
        } else {
            console.warn('TrafficContext - No user logged in, cannot save to Supabase');
        }
    };

    const filteredCampaigns = useMemo(() => {
        return data.campaigns.filter(c => {

            // Status Filter
            if (filters.status.length > 0 && !filters.status.includes(c.status)) return false;
            // Objective Filter
            if (filters.objective.length > 0 && !filters.objective.includes(c.objective)) return false;

            return true;
        });
    }, [data.campaigns, filters]);

    const kpis = useMemo<DashboardKPIs>(() => {
        const initial: DashboardKPIs = {
            totalSpend: 0,
            totalLeads: 0,
            totalOrganicLeads: 0,
            averageCpl: 0,
            connectRate: 0,
            averageCtr: 0,
            conversionRate: 0,
            cpa: 0,
            roas: 0,
            revenue: 0,
            totalImpressions: 0,
            totalReach: 0,
            totalLinkClicks: 0,
            totalPageViews: 0,
            totalHotLeads: 0,
            totalColdLeads: 0,
            bestLandingPage: '',
            bestLandingPageLeads: 0,
            totalLeads1a1: 0,
            totalMandouMsgApi: 0,
            totalRespondeuPesquisa: 0,
            totalLeadsGruposLegados: 0
        };

        const totals = filteredCampaigns.reduce((acc, curr) => {
            return {
                spend: acc.spend + curr.spend,
                leads: acc.leads + curr.leads,
                organicLeads: acc.organicLeads + (curr.organicLeads || 0),
                hotLeads: acc.hotLeads + (curr.hotLeads || 0),
                coldLeads: acc.coldLeads + (curr.coldLeads || 0),
                impressions: acc.impressions + curr.impressions,
                reach: acc.reach + curr.reach,
                clicks: acc.clicks + curr.clicks,
                linkClicks: acc.linkClicks + (curr.linkClicks || 0),
                pageViews: acc.pageViews + (curr.pageViews || 0),
                conversions: acc.conversions + curr.conversions,
                leads1a1: acc.leads1a1 + (curr.leads1a1 || 0),
                mandouMsgApi: acc.mandouMsgApi + (curr.mandouMsgApi || 0),
                respondeuPesquisa: acc.respondeuPesquisa + (curr.respondeuPesquisa || 0),
                leadsGruposLegados: acc.leadsGruposLegados + (curr.leadsGruposLegados || 0),
            };
        }, { spend: 0, leads: 0, organicLeads: 0, hotLeads: 0, coldLeads: 0, impressions: 0, reach: 0, clicks: 0, linkClicks: 0, pageViews: 0, conversions: 0, leads1a1: 0, mandouMsgApi: 0, respondeuPesquisa: 0, leadsGruposLegados: 0 });

        // Find best performing landing page
        const bestLP = filteredCampaigns.reduce((best, curr) => {
            if (!curr.bestLandingPage) return best;
            if (curr.bestLandingPageLeads > (best?.bestLandingPageLeads || 0)) {
                return curr;
            }
            return best;
        }, filteredCampaigns[0]);

        if (totals.spend === 0) return initial;

        return {
            totalSpend: totals.spend,
            totalLeads: totals.leads,
            totalOrganicLeads: totals.organicLeads,
            averageCpl: totals.leads > 0 ? totals.spend / totals.leads : 0,
            averageCtr: totals.impressions > 0 ? (totals.linkClicks / totals.impressions) * 100 : 0,
            // Connect Rate: Page Views / Link Clicks (Column K / Column J)
            connectRate: totals.linkClicks > 0 ? (totals.pageViews / totals.linkClicks) * 100 : 0,
            // LP Conversion Rate: Leads / Page Views (How many visitors became leads)
            conversionRate: totals.pageViews > 0 ? (totals.leads / totals.pageViews) * 100 : 0,
            cpa: totals.conversions > 0 ? totals.spend / totals.conversions : 0,
            revenue: 0, // Need revenue field in campaigns if available
            roas: 0,
            totalImpressions: totals.impressions,
            totalReach: totals.reach,
            totalLinkClicks: totals.linkClicks,
            totalPageViews: totals.pageViews,
            totalHotLeads: totals.hotLeads,
            totalColdLeads: totals.coldLeads,
            bestLandingPage: bestLP?.bestLandingPage || '',
            bestLandingPageLeads: bestLP?.bestLandingPageLeads || 0,
            totalLeads1a1: totals.leads1a1,
            totalMandouMsgApi: totals.mandouMsgApi,
            totalRespondeuPesquisa: totals.respondeuPesquisa,
            totalLeadsGruposLegados: totals.leadsGruposLegados
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
            kpis,
            dashboardConfig,
            updateDashboardConfig,
            trafficMapping,
            updateTrafficMapping
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
