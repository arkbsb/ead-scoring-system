import { useContext } from 'react';
import { TrafficContext } from '@/context/TrafficContext';
import { PublicDashboardContext } from '@/context/PublicDashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Snowflake, TrendingUp } from 'lucide-react';

export function LeadTemperature() {
    const publicContext = useContext(PublicDashboardContext);
    const privateContext = useContext(TrafficContext);
    const context = publicContext || privateContext;

    if (!context || context.loading) {
        return (
            <div className="animate-pulse">
                <div className="h-64 bg-muted/50 rounded-xl" />
            </div>
        );
    }

    const { kpis } = context;
    const totalTemperatureLeads = kpis.totalHotLeads + kpis.totalColdLeads;
    const hotPercentage = totalTemperatureLeads > 0 ? (kpis.totalHotLeads / totalTemperatureLeads) * 100 : 0;
    const coldPercentage = totalTemperatureLeads > 0 ? (kpis.totalColdLeads / totalTemperatureLeads) * 100 : 0;

    return (
        <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-white/10 overflow-hidden relative">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 pointer-events-none" />

            <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
                            Leads por Temperatura
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Classificação de qualidade dos leads captados
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border-white/10">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">{totalTemperatureLeads.toLocaleString('pt-BR')} Total</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hot Leads Card */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                        <Card className="relative bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30 hover:border-orange-500/50 transition-all duration-300 hover:scale-[1.02]">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm">
                                        <Flame className="h-8 w-8 text-orange-400" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-bold font-display text-orange-400 mb-1">
                                            {kpis.totalHotLeads.toLocaleString('pt-BR')}
                                        </div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                            Leads Quentes
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Percentual</span>
                                        <span className="font-bold text-orange-400">{hotPercentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-3 bg-background/50 rounded-full overflow-hidden backdrop-blur-sm">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${hotPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-xs text-muted-foreground/80 mt-4 leading-relaxed">
                                    Leads com alto potencial de conversão, demonstrando forte interesse e engajamento
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cold Leads Card */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                        <Card className="relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02]">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm">
                                        <Snowflake className="h-8 w-8 text-blue-400" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-bold font-display text-blue-400 mb-1">
                                            {kpis.totalColdLeads.toLocaleString('pt-BR')}
                                        </div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                            Leads Frios
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Percentual</span>
                                        <span className="font-bold text-blue-400">{coldPercentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-3 bg-background/50 rounded-full overflow-hidden backdrop-blur-sm">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${coldPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-xs text-muted-foreground/80 mt-4 leading-relaxed">
                                    Leads em estágio inicial, necessitando de nutrição e aquecimento para conversão
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
