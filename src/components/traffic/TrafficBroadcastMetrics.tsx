import { useContext } from 'react';
import { TrafficContext } from '@/context/TrafficContext';
import { PublicDashboardContext } from '@/context/PublicDashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, Users, Activity } from 'lucide-react';

export function TrafficBroadcastMetrics() {
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
    const totalSpecificLeads = kpis.totalLeads1a1 + kpis.totalLeadsGruposLegados;

    return (
        <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-white/10 overflow-hidden relative">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

            <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                            Origens Específicas
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Leads captados através de ações diretas e bases históricas
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border-white/10">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">{totalSpecificLeads.toLocaleString('pt-BR')} Total</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Broadcast Leads (Disparo) */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                        <Card className="relative bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02]">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-sm">
                                        <Megaphone className="h-8 w-8 text-purple-400" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-bold font-display text-purple-400 mb-1">
                                            {kpis.totalLeads1a1.toLocaleString('pt-BR')}
                                        </div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                            Leads de Disparo
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-xs text-muted-foreground/80 mt-4 leading-relaxed">
                                    Leads reativados ou captados através de disparos diretos (WhatsApp/Email)
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Legacy Group Leads (Grupos Legados) */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                        <Card className="relative bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.02]">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm">
                                        <Users className="h-8 w-8 text-emerald-400" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-bold font-display text-emerald-400 mb-1">
                                            {kpis.totalLeadsGruposLegados.toLocaleString('pt-BR')}
                                        </div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                            Grupos Legados
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-xs text-muted-foreground/80 mt-4 leading-relaxed">
                                    Leads provenientes de comunidades e grupos existentes (orgânico/histórico)
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
