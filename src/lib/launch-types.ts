export type LaunchType = 'Webinar' | 'Masterclass' | 'Mentoria' | 'Curso' | 'Desafio' | 'Outro';
export type LaunchStatus = 'Planejamento' | 'Ativo' | 'Pausado' | 'Finalizado';
export type CplScenarioType = 'Agressivo' | 'Padrão' | 'Conservador' | 'Acima';

export interface CplScenario {
    aggressive: number;
    standard: number;
    conservative: number;
}

export interface LaunchMetrics {
    // Budget
    invested: number;
    percentInvested: number;

    // Leads
    leads: number;
    percentLeads: number;

    // Cost
    cplReal: number;
    currentScenario: CplScenarioType;

    // Conversions
    conversions: number;
    conversionRate: number;
    revenue: number;
    roas: number;
    roi: number;
    ticket: number;
}

export interface Launch {
    id: string;
    name: string;
    description?: string;
    type: LaunchType;
    status: LaunchStatus;

    // Dates
    startDate: string; // ISO Date
    endDate: string;   // ISO Date

    // Goals
    totalBudget: number;
    leadGoal: number;

    // Scenarios
    cplScenarios: CplScenario;

    // Optional Conversion Goals
    conversionGoal?: number;
    averageTicket?: number;

    // Linked Traffic Data
    linkedCampaignIds: string[];

    // Real-time Data (Calculated/Fetched)
    metrics?: LaunchMetrics;

    // Metadata
    createdAt: string;
    updatedAt: string;
}
