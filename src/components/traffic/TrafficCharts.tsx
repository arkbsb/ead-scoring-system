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
import { Palette, Share2, Target, Trophy } from 'lucide-react';

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

    // Use ads from context (aliasing to ads to avoid confusion)
    const ads = (context as any).ads || [];

    // Prepare Creative CPL data for bar chart
    const creativeData = ads
        .filter((ad: any) => ad.leads > 0) // Only ads with leads
        .map((ad: any) => ({
            name: ad.name.length > 25 ? ad.name.substring(0, 22) + '...' : ad.name,
            fullName: ad.name,
            cpl: ad.cpl,
            leads: ad.leads,
            spend: ad.spend
        }))
        .sort((a: any, b: any) => a.cpl - b.cpl)
        .slice(0, 10); // Show top 10 best performers

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Efficiency Chart */}
            <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-50" />
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Share2 className="h-5 w-5 text-purple-400" />
                            Eficiência: Investimento vs Leads
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData}>
                                <defs>
                                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    yAxisId="left"
                                    stroke="#a855f7"
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `R$${v}`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#10b981"
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
                                    }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="spend"
                                    stroke="#a855f7"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSpend)"
                                    name="Investimento"
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="leads"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorLeads)"
                                    name="Leads"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Performance de Criativos - NEW */}
            <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-50" />
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-emerald-400" />
                            Top 10 Criativos (Menor CPL)
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full pt-4">
                        {creativeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={creativeData} margin={{ left: 10, right: 30 }}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={120}
                                        stroke="#94a3b8"
                                        fontSize={10}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        formatter={(value: any, name: string) => [
                                            name === 'cpl' ? `R$ ${Number(value).toFixed(2)}` : value,
                                            name === 'cpl' ? 'CPL' : 'Leads'
                                        ]}
                                    />
                                    <Bar dataKey="cpl" name="Custo por Lead" radius={[0, 4, 4, 0]}>
                                        {creativeData.map((entry: any, index: number) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.cpl < 15 ? '#10b981' : entry.cpl < 30 ? '#fbbf24' : '#ef4444'}
                                                fillOpacity={0.8}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                <Target className="h-12 w-12 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground max-w-[200px]">
                                    Nenhum dado de criativo disponível no momento.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* CPL Evolution */}
            <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-xl relative overflow-hidden lg:col-span-2 group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-50" />
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Palette className="h-5 w-5 text-amber-400" />
                        Evolução do Custo por Lead (CPL)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData}>
                                <defs>
                                    <linearGradient id="colorCpl" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#f59e0b"
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `R$${v}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    itemStyle={{ fontSize: '12px' }}
                                    formatter={(value: number | undefined) => [`R$ ${(value || 0).toFixed(2)}`, 'CPL']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="cpl"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
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
