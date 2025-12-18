export interface Lead {
    id: string;
    name: string; // Nome/Email
    email?: string;
    whatsapp?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    timestamp: string;
    age: string;
    hasChildren: string;
    gender: string;
    education: string;
    maritalStatus: string;
    followTime: string;
    hasStore: string;
    storeType: string;
    segment: string;
    difficulty: string;
    revenue: string;
    storeTime: string;
    management: string;
    digitalPresence: string;
    teamStructure: string;
    sales: string;
    dream: string;
    isStudent: string;
    challengeDifficulty: string;
    question: string;

    // Calculated
    score: number;
    segmentation: 'Super Qualificado' | 'Qualificado' | 'Não Qualificado';

    // Allow dynamic custom fields
    [key: string]: any;
}

export interface DashboardMetrics {
    totalLeads: number;
    averageScore: number;
    qualifiedLeads: number; // score > 500
    leadsByScoreRange: { range: string; count: number }[];
}

export type FilterMatchType = 'equals' | 'contains' | 'greater_than' | 'less_than' | 'starts_with' | 'ends_with';

export interface FilterRule {
    id: string;
    field: string;
    matchType: FilterMatchType;
    value: string | number;
}

export interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}

export interface AdvancedFilterState {
    search: string;
    segmentation: string; // 'all' | 'Super Qualificado' | ...
    minScore: number;
    maxScore: number;
    dateRange: DateRange;
    rules: FilterRule[];
}

// Deprecated: Keeping for backward compatibility if needed temporarily, but ideally removed
export interface FilterState {
    minScore: number;
    maxScore: number;
    search: string;
}
