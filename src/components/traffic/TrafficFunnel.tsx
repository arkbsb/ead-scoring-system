import { useContext } from 'react';
import { TrafficContext } from '@/context/TrafficContext';
import { PublicDashboardContext } from '@/context/PublicDashboardContext';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Eye, Users, MousePointer, FileText, UserCheck, Sprout, ChevronRight } from 'lucide-react';

export function TrafficFunnel() {
    const publicContext = useContext(PublicDashboardContext);
    const privateContext = useContext(TrafficContext);
    const context = publicContext || privateContext;

    if (!context || context.loading) {
        return (
            <div className="animate-pulse">
                <div className="h-48 bg-muted/50 rounded-xl" />
            </div>
        );
    }

    const { kpis } = context;

    const funnelSteps = [
        {
            label: 'Impressões',
            value: kpis.totalImpressions.toLocaleString('pt-BR'),
            icon: Eye,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            description: 'Vezes que o anúncio foi exibido'
        },
        {
            label: 'Alcance',
            value: kpis.totalReach.toLocaleString('pt-BR'),
            icon: Users,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            description: 'Pessoas únicas alcançadas'
        },
        {
            label: 'Cliques no Link',
            value: kpis.totalLinkClicks.toLocaleString('pt-BR'),
            icon: MousePointer,
            color: 'text-cyan-400',
            bg: 'bg-cyan-400/10',
            description: 'Cliques direcionados à LP'
        },
        {
            label: 'Visualizações LP',
            value: kpis.totalPageViews.toLocaleString('pt-BR'),
            icon: FileText,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            description: 'Acessos à landing page'
        },
        {
            label: 'Leads',
            value: kpis.totalLeads.toLocaleString('pt-BR'),
            icon: UserCheck,
            color: 'text-green-400',
            bg: 'bg-green-400/10',
            description: 'Conversões na LP'
        },
        {
            label: 'Leads Orgânicos',
            value: kpis.totalOrganicLeads.toLocaleString('pt-BR'),
            icon: Sprout,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            description: 'Captados organicamente'
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Funil de Conversão</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>

            <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/20 via-green-500/20 to-emerald-500/20 -translate-y-1/2 hidden lg:block" />

                {/* Funnel Steps */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative">
                    {funnelSteps.map((step, idx) => (
                        <div key={idx} className="relative">
                            <Card className="bg-card/50 backdrop-blur-sm border-white/5 hover:border-primary/30 transition-all hover:scale-105 relative z-10">
                                <CardContent className="p-4">
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <div className={cn("p-3 rounded-xl", step.bg)}>
                                            <step.icon className={cn("h-6 w-6", step.color)} />
                                        </div>
                                        <div className="space-y-1 w-full">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                {step.label}
                                            </p>
                                            <h3 className="text-xl font-bold font-display">
                                                {step.value}
                                            </h3>
                                            <p className="text-[10px] text-muted-foreground/70 leading-tight">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Arrow between cards (hidden on last item) */}
                            {idx < funnelSteps.length - 1 && (
                                <div className="hidden lg:flex absolute top-1/2 -right-2 -translate-y-1/2 z-20">
                                    <ChevronRight className="h-4 w-4 text-primary/40" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
