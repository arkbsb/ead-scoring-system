export type TrafficStatus = 'active' | 'paused' | 'ended' | 'archived';

// Custom Field Configuration Types
export type DisplaySection = 'kpis' | 'secondary' | 'funnel' | 'temperature' | 'sources' | 'table';
export type AggregationType = 'sum' | 'avg' | 'max' | 'min' | 'count' | 'first';
export type FormatType = 'currency' | 'number' | 'percentage' | 'text';

export interface MetricItem {
    label: string;
    value: string;
    icon: any; // Using any for LucideIcon to avoid import issues or complex types
    color: string;
    bg: string;
    change?: string;
    changeColor?: string;
}

export interface CustomField {
    key: string;
    label: string;
    index: number;
    displaySection: DisplaySection;
    aggregation: AggregationType;
    format: FormatType;
    icon?: string;
    color?: string;
}

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

    // Custom Fields
    [key: string]: any;
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
    leads1a1: number; // Column R - Leads from 1a1 API
    mandouMsgApi: number; // Column S - Contacted via API
    respondeuPesquisa: number; // Column T - Answered survey
    leadsGruposLegados: number; // Column U - Leads from Legacy Groups
    rawTotalLeads?: number; // Column V - Total leads (raw from spreadsheet)
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
    startDate: string;
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
    totalLeads1a1: number;
    totalMandouMsgApi: number;
    totalRespondeuPesquisa: number;
    totalLeadsGruposLegados: number;
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
export interface DashboardConfig {
    showKPIs: boolean;
    showActiveLaunch: boolean;
    showFunnel: boolean;
    showSecondaryMetrics: boolean;
    showLeadTemperature: boolean;
    showBroadcastMetrics: boolean;
    showLandingPagePerformance: boolean;
    showTables: boolean;
}

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
    showKPIs: true,
    showActiveLaunch: true,
    showFunnel: true,
    showSecondaryMetrics: true,
    showLeadTemperature: true,
    showBroadcastMetrics: true,
    showLandingPagePerformance: true,
    showTables: true,
};
export interface ColumnMapping {
    nameIndex: number;
    spendIndex: number;
    leadsIndex: number;
    impressionsIndex: number;
    clicksIndex: number;
    linkClicksIndex?: number;
    pageViewsIndex?: number;
    reachIndex?: number;
    organicLeadsIndex?: number;
    hotLeadsIndex?: number;
    coldLeadsIndex?: number;
    bestLandingPageIndex?: number;
    bestLandingPageLeadsIndex?: number;
    leads1a1Index?: number;
    mandouMsgApiIndex?: number;
    respondeuPesquisaIndex?: number;
    leadsGruposLegadosIndex?: number;
    customFields?: CustomField[];
}

export interface TrafficMapping {
    campaigns: {
        sheetName: string;
        mapping: ColumnMapping;
    };
    adSets: {
        sheetName: string;
        mapping: ColumnMapping;
    };
    ads: {
        sheetName: string;
        mapping: ColumnMapping;
    };
}

export const DEFAULT_TRAFFIC_MAPPING: TrafficMapping = {
    campaigns: {
        sheetName: 'Campanhas',
        mapping: {
            nameIndex: 1,
            spendIndex: 2,
            impressionsIndex: 3,
            clicksIndex: 4,
            reachIndex: 8,
            linkClicksIndex: 9,
            pageViewsIndex: 10,
            leadsIndex: 11,
            organicLeadsIndex: 12,
            hotLeadsIndex: 13,
            coldLeadsIndex: 14,
            bestLandingPageIndex: 15,
            bestLandingPageLeadsIndex: 16,
            leads1a1Index: 17,
            mandouMsgApiIndex: 18,
            respondeuPesquisaIndex: 19,
            leadsGruposLegadosIndex: 20,
        }
    },
    adSets: {
        sheetName: 'Conjunto de Ads',
        mapping: {
            nameIndex: 1,
            spendIndex: 2,
            impressionsIndex: 3,
            clicksIndex: 4,
            reachIndex: 8,
            linkClicksIndex: 9,
            pageViewsIndex: 10,
            leadsIndex: 11,
        }
    },
    ads: {
        sheetName: 'Anúncios',
        mapping: {
            nameIndex: 1,
            spendIndex: 2,
            impressionsIndex: 3,
            clicksIndex: 4,
            reachIndex: 8,
            linkClicksIndex: 9,
            pageViewsIndex: 10,
            leadsIndex: 11,
        }
    }
};
