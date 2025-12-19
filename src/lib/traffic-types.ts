export type TrafficStatus = 'active' | 'paused' | 'ended' | 'archived';

export interface BaseEntity {
    id: string;
    name: string;
    status: TrafficStatus;
    impressions: number;
    reach: number;
    clicks: number;
    linkClicks: number;
    pageViews: number;
    spend: number;
    leads: number;
    conversions: number;
    // Raw metrics from platform (often pre-calculated but we might recalculate)
    ctr: number; // %
    cpc: number; // currency
    cpm: number; // currency
    cpl: number; // currency

    // Engagement
    engagement: number; // total actions
}

export interface Campaign extends BaseEntity {
    startDate: string;
    endDate?: string;
    objective: string; // 'CONVERSION', 'TRAFFIC', 'AWARENESS'
    organicLeads: number; // Column M - Organic leads captured
    hotLeads: number; // Column N - Hot leads
    coldLeads: number; // Column O - Cold leads
    bestLandingPage: string; // Column P - Best performing landing page
    bestLandingPageLeads: number; // Column Q - Leads from best LP
}

export interface AdSet extends BaseEntity {
    campaignId: string;
    startDate: string;
    endDate?: string;
    segmentation: string; // e.g. "Lookalike 1%", "Interest: Marketing"
}

export interface Ad extends BaseEntity {
    adSetId: string;
    campaignId: string; // denormalized for easier filtering
    format: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
    creativeUrl?: string; // image/video thumbnail
}

// Metrics for the dashboard summary
export interface DashboardKPIs {
    totalSpend: number;
    totalLeads: number;
    totalOrganicLeads: number; // Sum of organic leads from all campaigns
    averageCpl: number;
    connectRate: number; // (Leads / Clicks) * 100
    averageCtr: number;
    conversionRate: number; // (Conversions / Leads) * 100
    cpa: number; // Spend / Conversions
    roas: number; // Revenue / Spend
    revenue: number; // Optional input

    // Funnel metrics
    totalImpressions: number;
    totalReach: number;
    totalLinkClicks: number;
    totalPageViews: number;

    // Temperature metrics
    totalHotLeads: number;
    totalColdLeads: number;

    // Landing page performance
    bestLandingPage: string;
    bestLandingPageLeads: number;
}

export interface TrafficFilterState {
    dateRange: {
        from?: Date;
        to?: Date;
    };
    campaignIds: string[];
    status: TrafficStatus[];
    objective: string[];
}
