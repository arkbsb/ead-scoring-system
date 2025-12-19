import { useContext } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrafficContext } from '@/context/TrafficContext';
import { PublicDashboardContext } from '@/context/PublicDashboardContext';

// Mock daily data since our main mock is aggregate
const dailyData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    spend: Math.floor(Math.random() * 500) + 100,
    leads: Math.floor(Math.random() * 20) + 5
})).map(d => ({ ...d, cpl: d.spend / d.leads }));

export function TrafficCharts() {
    const publicContext = useContext(PublicDashboardContext);
    const privateContext = useContext(TrafficContext);
    const context = publicContext || privateContext;

    if (!context || context.loading) return null;

    const campaigns = context.campaigns || [];

    // Prepare Campaign CPL data for bar chart
    const campaignData = campaigns.map(c => ({
        name: c.name.split(' - ')[0].replace('[GITA] ', ''), // simplify name
        cpl: c.cpl,
        leads: c.leads
    })).sort((a, b) => a.cpl - b.cpl);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Efficiency Chart */}
            <Card className="bg-card/50 backdrop-blur-sm border-white/5">
                <CardHeader>
                    <CardTitle className="text-lg">Eficiência: Investimento vs Leads</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData}>
                                <defs>
                                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="day" stroke="#666" fontSize={12} />
                                <YAxis yAxisId="left" stroke="#8b5cf6" fontSize={12} />
                                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="spend"
                                    stroke="#8b5cf6"
                                    fillOpacity={1}
                                    fill="url(#colorSpend)"
                                    name="Investimento (R$)"
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="leads"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorLeads)"
                                    name="Leads"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* CPL by Campaign */}
            <Card className="bg-card/50 backdrop-blur-sm border-white/5">
                <CardHeader>
                    <CardTitle className="text-lg">CPL por Campanha</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={campaignData} margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                <XAxis type="number" stroke="#666" unit=" BRL" />
                                <YAxis dataKey="name" type="category" width={100} stroke="#999" fontSize={11} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                />
                                <Bar dataKey="cpl" name="CPL (R$)" radius={[0, 4, 4, 0]}>
                                    {campaignData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.cpl < 15 ? '#10b981' : entry.cpl < 30 ? '#fbbf24' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* CPL Evolution */}
            <Card className="bg-card/50 backdrop-blur-sm border-white/5 lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-lg">Evolução do Custo por Lead (CPL)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData}>
                                <defs>
                                    <linearGradient id="colorCpl" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="day" stroke="#666" fontSize={12} />
                                <YAxis stroke="#fbbf24" fontSize={12} unit=" R$" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                    formatter={(value: number | undefined) => [`R$ ${(value || 0).toFixed(2)}`, 'CPL']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="cpl"
                                    stroke="#fbbf24"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorCpl)"
                                    name="CPL"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
