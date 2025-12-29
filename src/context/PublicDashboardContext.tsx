import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { getPublicShare, incrementViewCount } from '@/lib/public-share';
import { TrafficSheetParser } from '@/lib/traffic-integration';
import { fetchGoogleSheetData } from '@/lib/google-sheets';
import type { Campaign, AdSet, Ad, DashboardKPIs, TrafficMapping } from '@/lib/traffic-types';
import { DEFAULT_TRAFFIC_MAPPING } from '@/lib/traffic-types';
import type { Launch } from '@/lib/launch-types';

interface PublicDashboardContextType {
    campaigns: Campaign[];
    adSets: AdSet[];
    ads: Ad[];
    kpis: DashboardKPIs;
    loading: boolean;
    error: string | null;
    launch: Launch | null;
    shareInfo: {
        viewCount: number;
        createdAt: string;
    } | null;
    filters: {
        dateRange: { from: Date | undefined; to: Date | undefined };
        status: string[];
        objective: string[];
    };
    setFilters: (filters: any) => void;
    filteredCampaigns: Campaign[];
    trafficMapping: TrafficMapping;
}

export const PublicDashboardContext = createContext<PublicDashboardContextType | undefined>(undefined);

export function PublicDashboardProvider({ token, children }: { token: string; children: ReactNode }) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [adSets, setAdSets] = useState<AdSet[]>([]);
    const [ads, setAds] = useState<Ad[]>([]);
    const [trafficMapping, setTrafficMapping] = useState<TrafficMapping>(DEFAULT_TRAFFIC_MAPPING);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [launch, setLaunch] = useState<Launch | null>(null);
    const [shareInfo, setShareInfo] = useState<{ viewCount: number; createdAt: string } | null>(null);
    const [filters, setFilters] = useState({
        dateRange: { from: undefined as Date | undefined, to: undefined as Date | undefined },
        status: [] as string[],
        objective: [] as string[]
    });

    useEffect(() => {
        loadPublicDashboard();
    }, [token]);

    const loadPublicDashboard = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get share info
            const { data: share, error: shareError } = await getPublicShare(token);

            if (shareError || !share) {
                setError('Link inválido ou expirado');
                setLoading(false);
                return;
            }

            console.log('Public Share Info:', share);

            setShareInfo({
                viewCount: share.view_count,
                createdAt: share.created_at
            });

            // Increment view count
            await incrementViewCount(token);

            // Fetch traffic data
            if (share.spreadsheet_id) {
                const mapping = (share.traffic_mapping as TrafficMapping) || DEFAULT_TRAFFIC_MAPPING;
                setTrafficMapping(mapping);

                try {
                    console.log('Fetching public traffic data...');
                    const trafficData = await TrafficSheetParser.fetchAndParse(share.spreadsheet_id, mapping);
                    console.log('Parsed Traffic Data:', trafficData);
                    setCampaigns(trafficData.campaigns);
                    setAdSets(trafficData.adSets);
                    setAds(trafficData.ads);
                } catch (trafficErr) {
                    console.error("Failed to fetch public traffic data (Main Parser):", trafficErr);

                    // Fallback...
                    try {
                        const sheetData = await fetchGoogleSheetData({
                            id: 'public-traffic',
                            name: 'Public Traffic',
                            spreadsheetId: share.spreadsheet_id,
                            sheetName: mapping.campaigns.sheetName
                        });

                        if (sheetData && sheetData.length > 0) {
                            // Import parseCampaigns dynamically or move it to a shared lib if needed, 
                            // but it's already in traffic-integration.
                            const { parseCampaigns } = await import('@/lib/traffic-integration');
                            const parsedCampaigns = parseCampaigns(sheetData, mapping.campaigns.mapping);
                            setCampaigns(parsedCampaigns);
                        }
                    } catch (fallbackErr) {
                        console.error("Fallback fetch also failed:", fallbackErr);
                    }
                }
            }

            // Fetch launch data if associated
            if (share.launch_id) {
                console.log('Fetching public launch:', share.launch_id);
                const { data: launchData, error: launchError } = await supabase
                    .from('launches')
                    .select('*')
                    .eq('id', share.launch_id)
                    .single();

                if (launchError) {
                    console.error('Error fetching public launch:', launchError);
                } else {
                    console.log('Public Launch Data:', launchData);
                }

                if (!launchError && launchData) {
                    setLaunch({
                        id: launchData.id,
                        name: launchData.name,
                        description: launchData.description,
                        type: launchData.type,
                        status: launchData.status,
                        startDate: launchData.start_date,
                        endDate: launchData.end_date,
                        totalBudget: Number(launchData.total_budget),
                        leadGoal: Number(launchData.lead_goal),
                        cplScenarios: launchData.cpl_scenarios,
                        conversionGoal: launchData.conversion_goals?.goal,
                        averageTicket: launchData.conversion_goals?.ticket,
                        linkedCampaignIds: launchData.linked_campaign_ids || [],
                        createdAt: launchData.created_at,
                        updatedAt: launchData.updated_at
                    });
                }
            }

            setLoading(false);
        } catch (err: any) {
            console.error('Error loading public dashboard:', err);
            setError(err.message || 'Erro ao carregar dashboard');
            setLoading(false);
        }
    };

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter(c => {

            // Status Filter
            if (filters.status.length > 0 && !filters.status.includes(c.status)) return false;
            // Objective Filter
            if (filters.objective.length > 0 && !filters.objective.includes(c.objective)) return false;

            return true;
        });
    }, [campaigns, filters]);

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
            connectRate: totals.linkClicks > 0 ? (totals.pageViews / totals.linkClicks) * 100 : 0,
            conversionRate: totals.pageViews > 0 ? (totals.leads / totals.pageViews) * 100 : 0,
            cpa: totals.conversions > 0 ? totals.spend / totals.conversions : 0,
            revenue: 0,
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
        <PublicDashboardContext.Provider value={{
            campaigns,
            adSets,
            ads,
            kpis,
            loading,
            error,
            launch,
            shareInfo,
            filters,
            setFilters,
            filteredCampaigns,
            trafficMapping
        }}>
            {children}
        </PublicDashboardContext.Provider>
    );
}

export function usePublicDashboard() {
    const context = useContext(PublicDashboardContext);
    if (!context) {
        throw new Error('usePublicDashboard must be used within PublicDashboardProvider');
    }
    return context;
}
