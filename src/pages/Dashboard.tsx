import { useMemo } from 'react';
import { useLeads } from '@/context/LeadsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend } from 'recharts';
import { Users, Target, Flame, FileText, Smartphone, Globe, Trophy, Medal, RefreshCw, Bell, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Dashboard() {
    const { leads, loading, refresh } = useLeads();

    const metrics = useMemo(() => {
        const total = leads.length;
        const avgScore = total > 0 ? leads.reduce((acc, l) => acc + l.score, 0) / total : 0;
        const qualified = leads.filter(l => l.score >= 500 && l.score < 700).length;
        const superQualified = leads.filter(l => l.score >= 700).length;
        const notQualified = leads.filter(l => l.score < 500).length;

        // Histogram buckets
        const buckets = [0, 200, 400, 500, 600, 700, 800, 1000];
        const histogram = buckets.slice(0, -1).map((min, i) => {
            const max = buckets[i + 1];
            const count = leads.filter(l => l.score >= min && l.score < max).length;
            let fill = '#fbbf24'; // Default yellow
            if (min >= 700) fill = '#22c55e'; // Green for super qualified
            if (min < 400) fill = '#e5e7eb'; // Gray for low scores

            return {
                range: `${min}-${max}`,
                count,
                fill
            };
        });

        const qualityData = [
            { name: 'Super Qualificados', value: superQualified, color: '#22c55e' },
            { name: 'Qualificados', value: qualified, color: '#eab308' },
            { name: 'Não qualificados', value: notQualified, color: '#ef4444' },
        ].filter(d => d.value > 0);

        return { total, avgScore, qualified, superQualified, histogram, qualityData };
    }, [leads]);

    const topLeads = useMemo(() => {
        return [...leads].sort((a, b) => b.score - a.score).slice(0, 10);
    }, [leads]);

    if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Visão geral dos leads do lançamento</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refresh()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Atualizar
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Leads</CardTitle>
                            <div className="text-3xl font-bold">{metrics.total}</div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Leads importados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Score Médio</CardTitle>
                            <div className="text-3xl font-bold">{metrics.avgScore.toFixed(0)}</div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-slate-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Pontuação média</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Leads Qualificados</CardTitle>
                            <div className="text-3xl font-bold">{metrics.qualified}</div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Target className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Score {'>'} 500</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Super Qualificados</CardTitle>
                            <div className="text-3xl font-bold">{metrics.superQualified}</div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <Flame className="h-5 w-5 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Score {'>'} 700</p>
                    </CardContent>
                </Card>
            </div>

            {/* Middle Cards - Mocked Data for Visual Match */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase">Melhor Fonte</span>
                        </div>
                        <div className="text-2xl font-bold">WhatsApp</div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Score médio: 654 • 4 leads</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Smartphone className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase">Melhor Campanha</span>
                        </div>
                        <div className="text-2xl font-bold">-</div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Score médio: 0 • 0 leads</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase">Melhor Landing Page</span>
                        </div>
                        <div className="text-2xl font-bold">lp-reduzida</div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Score médio: 637 • 10 leads</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição de Scores</CardTitle>
                        <p className="text-sm text-muted-foreground">Quantidade de leads por faixa de pontuação</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.histogram}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                                    <XAxis
                                        dataKey="range"
                                        className="text-xs"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        className="text-xs"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {metrics.histogram.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Qualidade dos Leads</CardTitle>
                        <p className="text-sm text-muted-foreground">Segmentação por qualificação</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={metrics.qualityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {metrics.qualityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend verticalAlign="bottom" height={36} />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ranking List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            Ranking de Leads
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Top leads por pontuação</p>
                    </div>
                    <Button variant="ghost" className="text-sm">Ver todos</Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topLeads.map((lead, index) => (
                            <div
                                key={lead.id}
                                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-white
                                        ${index === 0 ? 'bg-amber-500' :
                                            index === 1 ? 'bg-slate-400' :
                                                index === 2 ? 'bg-amber-700' : 'bg-blue-600'}`}
                                    >
                                        {index + 1}
                                    </div>

                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                        {lead.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{lead.email || lead.name}</p>
                                            {index === 0 && <Trophy className="h-3 w-3 text-amber-500" />}
                                            {index === 1 && <Medal className="h-3 w-3 text-slate-400" />}
                                            {index === 2 && <Medal className="h-3 w-3 text-amber-700" />}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{lead.whatsapp || 'Sem WhatsApp'}</span>
                                            <span>•</span>
                                            <span>{new Date(lead.timestamp).toLocaleString('pt-BR')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xl font-bold">{lead.score} pts</p>
                                        <p className="text-xs text-muted-foreground">{lead.utm_source || 'Direto'}</p>
                                    </div>
                                    <div className={`rounded-full px-3 py-1 text-xs font-medium
                                        ${lead.score >= 700 ? 'bg-green-100 text-green-700' :
                                            lead.score >= 500 ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'}`}
                                    >
                                        {lead.score >= 700 ? 'Super Qualificado' :
                                            lead.score >= 500 ? 'Qualificado' : 'Não Qualificado'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
