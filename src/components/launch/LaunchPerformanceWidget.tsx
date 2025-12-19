import { useMemo } from 'react';
import { useTraffic } from '@/context/TrafficContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Users, Target } from 'lucide-react';
import { Launch } from '@/lib/launch-types';

interface LaunchPerformanceWidgetProps {
    launch: Launch;
}

export function LaunchPerformanceWidget({ launch }: LaunchPerformanceWidgetProps) {
    const { campaigns } = useTraffic();

    // Calculate Real Metrics based on Linked Campaigns
    const realMetrics = useMemo(() => {
        if (!launch || !campaigns || campaigns.length === 0) return { invested: 0, leads: 0, cpl: 0 };

        const linkedCampaigns = campaigns.filter(c => launch.linkedCampaignIds.includes(c.id));

        const invested = linkedCampaigns.reduce((acc, c) => acc + c.spend, 0);
        const leads = linkedCampaigns.reduce((acc, c) => acc + c.leads, 0);
        const cpl = leads > 0 ? invested / leads : 0;

        return { invested, leads, cpl };
    }, [launch, campaigns]);

    // Calculations for UI Percentages
    const budgetPercent = Math.min((realMetrics.invested / launch.totalBudget) * 100, 100);
    const leadsPercent = Math.min((realMetrics.leads / launch.leadGoal) * 100, 100);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Investment Card */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                        <span>INVESTIMENTO</span>
                        <Wallet className="h-4 w-4 text-purple-400" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white mb-1">
                        R$ {realMetrics.invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-3">
                        <span>Meta: R$ {launch.totalBudget.toLocaleString('pt-BR')}</span>
                        <span className={budgetPercent > 90 ? "text-red-400" : "text-green-400"}>
                            {budgetPercent.toFixed(1)}% usado
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${budgetPercent > 90 ? 'bg-red-500' : 'bg-purple-500'}`}
                            style={{ width: `${budgetPercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Restam: <span className="text-white font-medium">R$ {(launch.totalBudget - realMetrics.invested).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </p>
                </CardContent>
            </Card>

            {/* 2. Leads Card */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                        <span>LEADS CAPTADOS</span>
                        <Users className="h-4 w-4 text-blue-400" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white mb-1">
                        {realMetrics.leads.toLocaleString('pt-BR')}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-3">
                        <span>Meta: {launch.leadGoal.toLocaleString('pt-BR')}</span>
                        <span className={leadsPercent >= 100 ? "text-green-400" : "text-blue-400"}>
                            {leadsPercent.toFixed(1)}% da meta
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                            style={{ width: `${leadsPercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Faltam: <span className="text-white font-medium">{Math.max(0, launch.leadGoal - realMetrics.leads).toLocaleString('pt-BR')} leads</span>
                    </p>
                </CardContent>
            </Card>

            {/* 3. CPL Card */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-lg relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${realMetrics.cpl <= launch.cplScenarios.aggressive ? 'bg-green-500' :
                    realMetrics.cpl <= launch.cplScenarios.standard ? 'bg-yellow-500' :
                        'bg-red-500'
                    }`} />
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                        <span>CUSTO POR LEAD (CPL)</span>
                        <Target className="h-4 w-4 text-zinc-400" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white mb-1">
                        R$ {realMetrics.cpl.toFixed(2)}
                    </div>

                    <div className="space-y-2 mt-3">
                        {/* Comparison Bars */}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>Agressivo</span>
                            <span className="text-green-400">R$ {launch.cplScenarios.aggressive.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>Padrão</span>
                            <span className="text-blue-400">R$ {launch.cplScenarios.standard.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>Conservador</span>
                            <span className="text-yellow-400">R$ {launch.cplScenarios.conservative.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Status Atual</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${realMetrics.cpl <= launch.cplScenarios.aggressive ? 'bg-green-500/10 text-green-400' :
                            realMetrics.cpl <= launch.cplScenarios.standard ? 'bg-yellow-500/10 text-yellow-400' :
                                'bg-red-500/10 text-red-400'
                            }`}>
                            {realMetrics.cpl <= launch.cplScenarios.aggressive ? 'EXCELENTE' :
                                realMetrics.cpl <= launch.cplScenarios.standard ? 'NA META' :
                                    'ATENÇÃO'}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
