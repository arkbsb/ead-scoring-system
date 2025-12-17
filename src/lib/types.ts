export interface Lead {
    id: string;
    name: string; // Nome/Email
    email?: string;
    whatsapp?: string;
    utm_source?: string;
    utm_medium?: string;
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
}

export interface DashboardMetrics {
    totalLeads: number;
    averageScore: number;
    qualifiedLeads: number; // score > 500
    leadsByScoreRange: { range: string; count: number }[];
}

export interface FilterState {
    minScore: number;
    maxScore: number;
    age: string[];
    gender: string[];
    hasChildren: string | null;
    hasStore: string | null;
    storeType: string[];
    revenue: string[];
    storeTime: string[];
    education: string[];
    maritalStatus: string[];
    isStudent: string | null;
    search: string;
}
