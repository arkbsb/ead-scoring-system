import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTrafficMetrics } from '@/hooks/useTrafficMetrics';

export function TrafficKPIs({ hideStandardMetrics = false }: { hideStandardMetrics?: boolean }) {
    const { customKPIs, standardMetrics, loading } = useTrafficMetrics();

    if (loading) {
        return <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted/50 rounded-xl" />
            ))}
        </div>;
    }

    const allMetrics = [
        ...(hideStandardMetrics ? [] : standardMetrics),
        ...customKPIs
    ];

    if (allMetrics.length === 0) return null;

    return (
        <div className={cn(
            "grid gap-4",
            allMetrics.length <= 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        )}>
            {allMetrics.map((item, idx) => (
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
