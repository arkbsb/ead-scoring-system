import { useTraffic } from '@/context/TrafficContext';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    DollarSign,
    Users,
    TrendingDown,
    TrendingUp,
    Target,
    MousePointer,
    Zap,
    ShoppingCart
} from 'lucide-react';

export function TrafficKPIs() {
    const { kpis, loading } = useTraffic();

    if (loading) {
        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-muted/50 rounded-xl" />
            ))}
        </div>;
    }

    const items = [
        {
            label: 'Investimento Total',
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.totalSpend),
            icon: DollarSign,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            change: '+12%', // Mock change
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
        },
        {
            label: 'Connect Rate',
            value: `${kpis.connectRate.toFixed(1)}%`,
            icon: Target,
            color: 'text-rose-400',
            bg: 'bg-rose-400/10',
            sub: 'Meta: 40%'
        },
        // Row 2
        {
            label: 'CTR Médio',
            value: `${kpis.averageCtr.toFixed(2)}%`,
            icon: MousePointer,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            sub: 'Indústria: 1-3%'
        },
        {
            label: 'Taxa de Conversão',
            value: `${kpis.conversionRate.toFixed(2)}%`,
            icon: Zap,
            color: 'text-yellow-400',
            bg: 'bg-yellow-400/10',
            sub: 'Leads -> Vendas'
        },
        {
            label: 'CPA',
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.cpa),
            icon: ShoppingCart,
            color: 'text-cyan-400',
            bg: 'bg-cyan-400/10'
        },
        {
            label: 'ROAS',
            value: `${kpis.roas.toFixed(2)}x`,
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            change: '+0.5',
            changeColor: 'text-green-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, idx) => (
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
                            {item.sub && (
                                <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
