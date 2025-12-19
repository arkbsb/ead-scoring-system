import { useTraffic } from '@/context/TrafficContext';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    DollarSign,
    Users,
    TrendingDown
} from 'lucide-react';

export function TrafficKPIs() {
    const { kpis, loading } = useTraffic();

    if (loading) {
        return <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted/50 rounded-xl" />
            ))}
        </div>;
    }

    const mainMetrics = [
        {
            label: 'Investimento Total',
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.totalSpend),
            icon: DollarSign,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            change: '+12%',
            changeColor: 'text-green-500'
        },
        {
            label: 'Leads Gerados',
            value: kpis.totalLeads.toLocaleString('pt-BR'),
            icon: Users,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            change: '+5%',
            changeColor: 'text-green-500'
        },
        {
            label: 'CPL Médio',
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.averageCpl),
            icon: TrendingDown,
            color: 'text-green-400',
            bg: 'bg-green-400/10',
            change: '-2%',
            changeColor: 'text-green-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mainMetrics.map((item, idx) => (
                <Card key={idx} className="bg-card/50 backdrop-blur-sm border-white/5 hover:border-primary/20 transition-all">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-2 rounded-lg", item.bg)}>
                                <item.icon className={cn("h-5 w-5", item.color)} />
                            </div>
                            {item.change && (
                                <span className={cn("text-xs font-medium px-2 py-1 rounded-full bg-background/50", item.changeColor)}>
                                    {item.change}
                                </span>
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                            <h3 className="text-2xl font-bold font-display">{item.value}</h3>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
