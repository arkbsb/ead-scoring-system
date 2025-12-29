import { useContext, useMemo } from 'react';
import { TrafficContext } from '@/context/TrafficContext';
import { PublicDashboardContext } from '@/context/PublicDashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, Users, Activity } from 'lucide-react';
import { aggregateCustomField, formatCustomValue } from '@/lib/aggregation-utils';
import { getIcon } from '@/lib/icon-utils';
import { cn } from '@/lib/utils';

const COLOR_MAP: Record<string, string> = {
    purple: 'indigo',
    blue: 'cyan',
    green: 'emerald',
    yellow: 'amber',
    red: 'orange',
    pink: 'rose',
    cyan: 'sky',
    orange: 'red',
    emerald: 'teal',
    indigo: 'violet'
};

function getMetricStyles(color: string) {
    const nextColor = COLOR_MAP[color] || color;
    return {
        text: `text-${color}-400`,
        bg: `bg-gradient-to-br from-${color}-500/10 to-${nextColor}-500/10`,
        glow: `bg-gradient-to-br from-${color}-500/20 to-${nextColor}-500/20`,
        borderColor: `border-${color}-500/30`,
        hoverBorderColor: `hover:border-${color}-500/50`,
    };
}

export function TrafficBroadcastMetrics() {
    const publicContext = useContext(PublicDashboardContext);
    const privateContext = useContext(TrafficContext);
    const context = publicContext || privateContext;

    const customSourceMetrics = useMemo(() => {
        // We always use privateContext for mapping if available, otherwise check public
        const mapping = privateContext?.trafficMapping || (publicContext as any)?.trafficMapping;
        const filteredCampaigns = context?.filteredCampaigns || [];

        if (!mapping) return [];

        const customFields = mapping.campaigns.mapping.customFields || [];
        const sourceFields = customFields.filter(cf => cf.displaySection === 'sources');

        return sourceFields.map(field => {
            const aggregatedValue = aggregateCustomField(filteredCampaigns, field);
            const formattedValue = formatCustomValue(aggregatedValue, field.format);
            const Icon = getIcon(field.icon);
            const styles = getMetricStyles(field.color || 'purple');

            return {
                label: field.label,
                value: formattedValue,
                rawValue: typeof aggregatedValue === 'number' ? aggregatedValue : 0,
                icon: Icon,
                ...styles,
                description: `Métrica customizada - ${field.label}`
            };
        });
    }, [context]);

    if (!context || context.loading) {
        return (
            <div className="animate-pulse">
                <div className="h-64 bg-muted/50 rounded-xl" />
            </div>
        );
    }

    const { kpis } = context;
    const totalSpecificLeads = kpis.totalLeads1a1 + kpis.totalLeadsGruposLegados +
        customSourceMetrics.reduce((acc, m) => acc + m.rawValue, 0);

    const allSourceMetrics = [
        {
            label: 'Leads de Disparo',
            value: kpis.totalLeads1a1.toLocaleString('pt-BR'),
            rawValue: kpis.totalLeads1a1,
            icon: Megaphone,
            ...getMetricStyles('purple'),
            description: 'Leads reativados ou captados através de disparos diretos (WhatsApp/Email)'
        },
        {
            label: 'Grupos Legados',
            value: kpis.totalLeadsGruposLegados.toLocaleString('pt-BR'),
            rawValue: kpis.totalLeadsGruposLegados,
            icon: Users,
            ...getMetricStyles('emerald'),
            description: 'Leads provenientes de comunidades e grupos existentes (orgânico/histórico)'
        },
        ...customSourceMetrics
    ];

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
                <div className={cn(
                    "grid gap-6",
                    allSourceMetrics.length <= 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}>
                    {allSourceMetrics.map((metric, idx) => (
                        <div key={idx} className="relative group">
                            <div className={cn(
                                "absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60",
                                metric.glow
                            )} />
                            <Card className={cn(
                                "relative border transition-all duration-300 hover:scale-[1.02] bg-background/40 backdrop-blur-sm",
                                metric.bg,
                                metric.borderColor,
                                metric.hoverBorderColor
                            )}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn("p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-white/5")}>
                                            <metric.icon className={cn("h-8 w-8", metric.text)} />
                                        </div>
                                        <div className="text-right">
                                            <div className={cn("text-4xl font-bold font-display mb-1", metric.text)}>
                                                {metric.value}
                                            </div>
                                            <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                                {metric.label}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-muted-foreground/80 mt-4 leading-relaxed line-clamp-2">
                                        {metric.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
