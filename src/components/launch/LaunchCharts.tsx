import { useMemo } from 'react';
import { useTraffic } from '@/context/TrafficContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Launch } from '@/lib/launch-types';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface LaunchChartsProps {
    launch: Launch;
}

export function LaunchCharts({ launch }: LaunchChartsProps) {
    const { campaigns } = useTraffic();

    const metrics = useMemo(() => {
        if (!launch || !campaigns) return { realLeads: 0, realCpl: 0 };
        const linked = campaigns.filter(c => launch.linkedCampaignIds.includes(c.id));
        const invested = linked.reduce((acc, c) => acc + c.spend, 0);
        const leads = linked.reduce((acc, c) => acc + c.leads, 0);
        const cpl = leads > 0 ? invested / leads : 0;
        return { realLeads: leads, realCpl: cpl };
    }, [launch, campaigns]);

    // Data for Funnel (Meta vs Real)
    const funnelData = [
        { name: 'Leads (Meta)', value: launch.leadGoal, type: 'meta' },
        { name: 'Leads (Real)', value: metrics.realLeads, type: 'real' },
    ];

    // Calculate Gauge Rotation for CPL
    // Min: 0, Max: Conservative * 1.5
    const maxGaugeValue = launch.cplScenarios.conservative * 1.5;
    const gaugeValue = Math.min(metrics.realCpl, maxGaugeValue);
    const gaugePercent = (gaugeValue / maxGaugeValue) * 100;

    // Determine color based on scenario
    let gaugeColor = '#ef4444'; // Red
    if (metrics.realCpl <= launch.cplScenarios.aggressive) gaugeColor = '#22c55e'; // Green
    else if (metrics.realCpl <= launch.cplScenarios.standard) gaugeColor = '#3b82f6'; // Blue
    else if (metrics.realCpl <= launch.cplScenarios.conservative) gaugeColor = '#eab308'; // Yellow

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 1. CPL Gauge (Visual Speedometer) */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        VELOCÍMETRO DE CPL
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-6">
                    <div className="relative w-48 h-24 overflow-hidden mb-4">
                        <div className="absolute w-44 h-44 bg-white/10 rounded-full top-0 left-2 box-border border-[10px] border-white/5" />
                        {/* Needle - Simplified Visual Representation using rotation */}
                        <div
                            className="absolute bottom-0 left-1/2 w-[2px] h-[90px] bg-white origin-bottom transition-all duration-1000 ease-out"
                            style={{
                                transform: `translateX(-50%) rotate(${(gaugePercent * 1.8) - 90}deg)`
                            }}
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                        </div>
                        <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full" />
                    </div>

                    <div className="text-3xl font-bold text-white mb-2" style={{ color: gaugeColor }}>
                        R$ {metrics.realCpl.toFixed(2)}
                    </div>

                    <div className="flex w-full justify-between text-[10px] text-muted-foreground px-8">
                        <div className="text-center">
                            <span className="block text-green-400">R$ {launch.cplScenarios.aggressive}</span>
                            <span>Excelente</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-blue-400">R$ {launch.cplScenarios.standard}</span>
                            <span>Meta</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-yellow-400">R$ {launch.cplScenarios.conservative}</span>
                            <span>Atenção</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Performance Funnel (Meta vs Real) */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        META VS REALIZADO (LEADS)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    tick={{ fill: '#a1a1aa', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.type === 'meta' ? '#3b82f6' : entry.value >= funnelData[0].value ? '#22c55e' : '#eab308'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-sm px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                            <span className="text-muted-foreground">Meta: {launch.leadGoal.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-sm ${metrics.realLeads >= launch.leadGoal ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <span className="text-muted-foreground">Real: {metrics.realLeads.toLocaleString()}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
