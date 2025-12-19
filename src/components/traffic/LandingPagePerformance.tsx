import { useTraffic } from '@/context/TrafficContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, Sparkles, Award } from 'lucide-react';

export function LandingPagePerformance() {
    const { kpis, loading } = useTraffic();

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-56 bg-muted/50 rounded-xl" />
            </div>
        );
    }

    const conversionRate = kpis.totalPageViews > 0
        ? (kpis.bestLandingPageLeads / kpis.totalPageViews) * 100
        : 0;

    return (
        <Card className="bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl border-white/10 overflow-hidden relative group">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-purple-500/10 opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

            {/* Sparkle effects */}
            <div className="absolute top-4 right-4 animate-pulse">
                <Sparkles className="h-6 w-6 text-yellow-400/50" />
            </div>
            <div className="absolute bottom-4 left-4 animate-pulse delay-75">
                <Sparkles className="h-4 w-4 text-purple-400/50" />
            </div>

            <CardHeader className="relative z-10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 backdrop-blur-sm">
                        <Trophy className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                            Landing Page Campeã
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Melhor desempenho em geração de leads
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Landing Page Name Card */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-2xl blur-xl" />
                        <Card className="relative bg-gradient-to-br from-yellow-500/5 to-amber-500/5 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 backdrop-blur-sm flex-shrink-0">
                                        <Award className="h-7 w-7 text-yellow-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                            Nome da Landing Page
                                        </p>
                                        <h3 className="text-xl font-bold text-yellow-400 truncate mb-1">
                                            {kpis.bestLandingPage || 'Nenhuma LP identificada'}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-3">
                                            <div className="h-1.5 flex-1 bg-background/50 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-1000"
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-yellow-400">TOP 1</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Leads Count Card */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl" />
                        <Card className="relative bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm flex-shrink-0">
                                        <TrendingUp className="h-7 w-7 text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                            Leads Gerados
                                        </p>
                                        <h3 className="text-3xl font-bold font-display text-purple-400 mb-1">
                                            {kpis.bestLandingPageLeads.toLocaleString('pt-BR')}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-3">
                                            <div className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">
                                                <span className="text-xs font-semibold text-purple-400">
                                                    {conversionRate.toFixed(1)}% de conversão
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Performance Badge */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-pink-500/10 border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-3">
                        <Trophy className="h-5 w-5 text-yellow-400" />
                        <p className="text-sm font-medium text-center">
                            <span className="text-yellow-400 font-bold">{kpis.bestLandingPageLeads}</span>
                            {' '}leads captados pela melhor landing page
                            {kpis.totalLeads > 0 && (
                                <span className="text-muted-foreground ml-1">
                                    ({((kpis.bestLandingPageLeads / kpis.totalLeads) * 100).toFixed(1)}% do total)
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
