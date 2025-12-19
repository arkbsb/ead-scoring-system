import { useTraffic } from '@/context/TrafficContext';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, MousePointer, Zap, Target, Radio } from 'lucide-react';

export function TrafficSecondaryMetrics() {
    const { kpis, loading } = useTraffic();

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-pulse">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-28 bg-muted/50 rounded-xl" />
                ))}
            </div>
        );
    }

    const frequency = kpis.totalReach > 0 ? kpis.totalImpressions / kpis.totalReach : 0;

    const secondaryMetrics = [
        {
            label: 'CPM',
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                kpis.totalImpressions > 0 ? (kpis.totalSpend / kpis.totalImpressions) * 1000 : 0
            ),
            icon: TrendingUp,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            description: 'Custo por mil impressões'
        },
        {
            label: 'CTR',
            value: `${kpis.averageCtr.toFixed(2)}%`,
            icon: MousePointer,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            description: 'Taxa de cliques'
        },
        {
            label: 'Frequência',
            value: frequency.toFixed(2),
            icon: Radio,
            color: 'text-cyan-400',
            bg: 'bg-cyan-400/10',
            description: 'Impressões / Alcance'
        },
        {
            label: 'Taxa de Conversão LP',
            value: `${kpis.conversionRate.toFixed(2)}%`,
            icon: Zap,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            description: 'Page Views → Leads'
        },
        {
            label: 'Connect Rate',
            value: `${kpis.connectRate.toFixed(1)}%`,
            icon: Target,
            color: 'text-green-400',
            bg: 'bg-green-400/10',
            description: 'Link Clicks → Page Views'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {secondaryMetrics.map((metric, idx) => (
                <Card key={idx} className="bg-card/30 backdrop-blur-sm border-white/5 hover:border-primary/20 transition-all">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className={cn("p-2 rounded-lg flex-shrink-0", metric.bg)}>
                                <metric.icon className={cn("h-4 w-4", metric.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    {metric.label}
                                </p>
                                <h3 className="text-lg font-bold font-display truncate">
                                    {metric.value}
                                </h3>
                                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                    {metric.description}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
