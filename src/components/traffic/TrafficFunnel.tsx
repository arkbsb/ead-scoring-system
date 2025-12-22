import { useContext } from 'react';
import { TrafficContext } from '@/context/TrafficContext';
import { PublicDashboardContext } from '@/context/PublicDashboardContext';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    Eye,
    MousePointer,
    FileText,
    UserCheck,
    ClipboardCheck,
    MessageSquare,
    TrendingUp,
    AlertTriangle,
    ChevronDown
} from 'lucide-react';

export function TrafficFunnel() {
    const publicContext = useContext(PublicDashboardContext);
    const privateContext = useContext(TrafficContext);
    const context = publicContext || privateContext;

    if (!context || context.loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-48 bg-muted/30 rounded-3xl" />
            </div>
        );
    }

    const { kpis } = context;

    const steps = [
        {
            id: 'impressions',
            label: 'Impressões',
            value: kpis.totalImpressions,
            icon: Eye,
            gradient: 'from-[#6366f1] to-[#8b5cf6]', // Indigo to Violet
            description: 'Visualização'
        },
        {
            id: 'clicks',
            label: 'Cliques no Link',
            value: kpis.totalLinkClicks,
            icon: MousePointer,
            gradient: 'from-[#3b82f6] to-[#06b6d4]', // Blue to Cyan
            description: 'Interesse'
        },
        {
            id: 'pageviews',
            label: 'Vezes na LP',
            value: kpis.totalPageViews,
            icon: FileText,
            gradient: 'from-[#06b6d4] to-[#10b981]', // Cyan to Emerald
            description: 'Engajamento'
        },
        {
            id: 'leads',
            label: 'Leads',
            value: kpis.totalLeads,
            icon: UserCheck,
            gradient: 'from-[#10b981] to-[#6366f1]', // Emerald to Indigo
            description: 'Conversão'
        },
        {
            id: 'survey',
            label: 'Pesquisa',
            value: kpis.totalRespondeuPesquisa,
            icon: ClipboardCheck,
            gradient: 'from-[#f59e0b] to-[#ef4444]', // Amber to Red
            description: 'Perfil'
        },
        {
            id: 'msg',
            label: 'WhatsApp',
            value: kpis.totalMandouMsgApi,
            icon: MessageSquare,
            gradient: 'from-[#ef4444] to-[#ec4899]', // Red to Pink
            description: 'Final'
        }
    ];

    return (
        <Card className="border-none bg-background/40 backdrop-blur-xl shadow-inner overflow-hidden border border-white/5">
            <CardContent className="p-4 lg:p-8">
                <div className="flex flex-col items-center max-w-5xl mx-auto space-y-0.5">
                    {steps.map((step, idx) => {
                        const nextStep = steps[idx + 1];
                        const conversion = nextStep ? (step.value > 0 ? (nextStep.value / step.value) * 100 : 0) : null;

                        // Bottleneck logic: Only from Clicks onwards
                        const isBottleneck = idx > 0 && conversion !== null && conversion < 20;

                        // Tapering width: 100% to 50%
                        const width = 100 - (idx * 9);

                        return (
                            <div key={step.id} className="w-full flex flex-col items-center group relative">
                                {/* The Funnel Level */}
                                <div
                                    className={cn(
                                        "relative h-12 lg:h-14 flex items-center justify-between px-8 lg:px-20 transition-all duration-300",
                                        "bg-gradient-to-r", step.gradient,
                                        "hover:brightness-110 cursor-default shadow-lg"
                                    )}
                                    style={{
                                        width: `${width}%`,
                                        clipPath: 'polygon(3% 0%, 97% 0%, 100% 100%, 0% 100%)',
                                        zIndex: steps.length - idx
                                    }}
                                >
                                    {/* Subtle texture */}
                                    <div className="absolute inset-0 bg-white/5 pointer-events-none" />

                                    <div className="flex items-center justify-between w-full relative z-10 gap-4">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <step.icon className="h-4 w-4 text-white/90 shrink-0" />
                                            <div className="truncate">
                                                <h3 className="text-white font-black text-[10px] lg:text-xs uppercase tracking-widest leading-none">
                                                    {step.label}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0 flex items-baseline gap-1.5">
                                            <span className="text-sm lg:text-xl font-black text-white leading-none tracking-tight">
                                                {step.value.toLocaleString('pt-BR')}
                                            </span>
                                            <span className="text-[7px] lg:text-[8px] font-bold text-white/50 uppercase">
                                                unid.
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Conversion Indicator */}
                                {conversion !== null && (
                                    <div className="h-6 lg:h-7 flex items-center justify-center relative w-full" style={{ zIndex: 50 }}>
                                        <div className={cn(
                                            "flex items-center gap-1 px-3 py-0.5 rounded-full border text-white shadow-md transition-all duration-300 transform -translate-y-1/2",
                                            isBottleneck
                                                ? "bg-red-600 border-red-400 animate-pulse"
                                                : "bg-[#18181b]/80 border-white/10 backdrop-blur-sm"
                                        )}>
                                            {isBottleneck ? (
                                                <AlertTriangle className="h-2.5 w-2.5 text-white" />
                                            ) : (
                                                <ChevronDown className="h-3 w-3 text-white/40" />
                                            )}
                                            <span className="text-[8px] lg:text-[10px] font-black tracking-tighter">
                                                {conversion.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Compact KPI Row */}
                <div className="mt-8 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center">
                        <TrendingUp className="h-3.5 w-3.5 text-indigo-400 mb-1.5" />
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Eficiência Global</span>
                        <span className="text-sm font-black text-white">
                            {steps[0].value > 0 ? ((steps[5].value / steps[0].value) * 100).toFixed(3) : 0}%
                        </span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-400 mb-1.5" />
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">CPL Dashboard</span>
                        <span className="text-sm font-black text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.totalSpend / (kpis.totalLeads || 1))}
                        </span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center">
                        <MessageSquare className="h-3.5 w-3.5 text-rose-400 mb-1.5" />
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Aproveitamento API</span>
                        <span className="text-sm font-black text-white">
                            {((kpis.totalMandouMsgApi / (kpis.totalLeads || 1)) * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center">
                        <MousePointer className="h-3.5 w-3.5 text-cyan-400 mb-1.5" />
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">CTR (Link Click)</span>
                        <span className="text-sm font-black text-white">
                            {kpis.averageCtr.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
