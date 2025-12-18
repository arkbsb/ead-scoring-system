import { useMemo } from 'react';
import { useLeads } from '@/context/LeadsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend } from 'recharts';
import { Users, Target, Flame, FileText, Globe, Trophy, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';



export function Dashboard() {
    const { leads, loading, refresh } = useLeads();

    const metrics = useMemo(() => {
        const total = leads.length;
        const avgScore = total > 0 ? leads.reduce((acc, l) => acc + l.score, 0) / total : 0;
        const qualified = leads.filter(l => l.segmentation === 'Qualificado').length;
        const superQualified = leads.filter(l => l.segmentation === 'Super Qualificado').length;
        const notQualified = leads.filter(l => l.segmentation === 'Não Qualificado').length;

        // Histogram buckets
        const buckets = [0, 200, 400, 500, 600, 700, 800, 1000];
        const histogram = buckets.slice(0, -1).map((min, i) => {
            const max = buckets[i + 1];
            const count = leads.filter(l => l.score >= min && l.score < max).length;
            let fill = '#252541'; // default muted
            if (min >= 700) fill = '#10B981'; // Mint
            if (min >= 500 && min < 700) fill = '#F59E0B'; // Amber
            if (min < 400) fill = '#EF4444'; // Red

            return {
                range: `${min}-${max}`,
                count,
                fill
            };
        });

        const qualityData = [
            { name: 'Super Qualificados', value: superQualified, color: '#10B981' }, // Mint
            { name: 'Qualificados', value: qualified, color: '#F59E0B' }, // Amber
            { name: 'Não Qualificados', value: notQualified, color: '#EF4444' }, // Red
        ].filter(d => d.value > 0);

        // ... (rest of filtering logic)

        // Helper to find best performing property based on Super Qualified count
        const getBestMetric = (key: keyof typeof leads[0]) => {
            const groups: Record<string, { superQualifiedCount: number; total: number }> = {};

            leads.forEach(lead => {
                const value = String(lead[key] || '').toLowerCase();
                if (!value || value === 'undefined') return;

                if (!groups[value]) groups[value] = { superQualifiedCount: 0, total: 0 };
                groups[value].total += 1;

                if (lead.segmentation === 'Super Qualificado') {
                    groups[value].superQualifiedCount += 1;
                }
            });

            let best = { name: '', count: 0, total: 0 };

            Object.entries(groups).forEach(([name, data]) => {
                // Determine best by absolute number of Super Qualified leads
                if (data.superQualifiedCount > best.count) {
                    best = { name, count: data.superQualifiedCount, total: data.total };
                }
            });

            return best;
        };

        const bestSource = getBestMetric('utm_source');
        const bestAudience = getBestMetric('utm_medium'); // Mapping "Público" to Medium as per request context
        const bestCreative = getBestMetric('utm_content'); // Mapping "Criativo" to Content

        return { total, avgScore, qualified, superQualified, histogram, qualityData, bestSource, bestAudience, bestCreative };
    }, [leads]);

    const topLeads = useMemo(() => {
        return [...leads].sort((a, b) => b.score - a.score).slice(0, 10);
    }, [leads]);

    if (loading) return <div className="flex items-center justify-center h-full text-white">Carregando dados...</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-8">
            {/* Header Actions */}
            <div className="flex justify-end">
                <Button variant="outline" onClick={() => refresh()} className="border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text-primary-light dark:hover:text-white transition-all bg-white dark:bg-dark-elem">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar Dados
                </Button>
            </div>

            {/* Top Cards (KPIs) */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Total de Leads", value: metrics.total, sub: "Leads importados", icon: Users, color: "text-purple-dark dark:text-purple-light", bg: "bg-purple-light/10 dark:bg-purple/10" },
                    { title: "Score Médio", value: metrics.avgScore.toFixed(0), sub: "Pontuação global", icon: TrendingUp, color: "text-mint-dark dark:text-mint", bg: "bg-mint-light/10 dark:bg-mint/10" },
                    { title: "Qualificados", value: metrics.qualified, sub: "Score > 500", icon: Target, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10" },
                    { title: "Super Qualificados", value: metrics.superQualified, sub: "Score > 700", icon: Flame, color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/10" }
                ].map((kpi, i) => (
                    <Card key={i} className="hover:border-purple/30 transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{kpi.title}</CardTitle>
                            <div className={`h-10 w-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-mono font-semibold mt-2">{kpi.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Middle Cards - Best Performers */}
            <div className="grid gap-6 md:grid-cols-3">
                {[
                    { title: "Melhor Público (Medium)", icon: Users, metric: metrics.bestAudience },
                    { title: "Melhor Criativo (Content)", icon: FileText, metric: metrics.bestCreative },
                    { title: "Melhor Origem (Source)", icon: Globe, metric: metrics.bestSource }
                ].map((item, i) => (
                    <Card key={i} className="shadow-lg hover:border-mint/30 transition-all duration-300">
                        <CardHeader className="space-y-1 pb-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <item.icon className="h-4 w-4 text-purple-dark dark:text-purple-light" />
                                <span className="text-xs font-medium uppercase tracking-wider">{item.title}</span>
                            </div>
                            <div className="text-2xl font-bold truncate" title={item.metric.name || '-'}>
                                {item.metric.name || '-'}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm font-bold text-mint-dark dark:text-mint">{item.metric.count} super qualificados</span>
                                <span className="text-xs text-muted-foreground">/ {item.metric.total} total</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Distribuição de Scores</CardTitle>
                        <p className="text-sm text-muted-foreground">Concentração de leads por faixa de pontuação</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.histogram}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" className="opacity-10 stroke-black dark:stroke-white" />
                                    <XAxis
                                        dataKey="range"
                                        className="text-xs font-mono fill-muted-foreground"
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        className="text-xs font-mono fill-muted-foreground"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'currentColor', opacity: 0.1 }}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderRadius: '12px',
                                            border: '1px solid hsl(var(--border))',
                                            color: 'hsl(var(--card-foreground))'
                                        }}
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

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Qualidade dos Leads</CardTitle>
                        <p className="text-sm text-muted-foreground">Segmentação atual da base</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={metrics.qualityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {metrics.qualityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-foreground">{value}</span>} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderRadius: '12px',
                                            border: '1px solid hsl(var(--border))',
                                            color: 'hsl(var(--card-foreground))'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--card-foreground))' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ranking List */}
            <Card className="shadow-lg overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                    <div>
                        <CardTitle className="flex items-center gap-3">
                            <Trophy className="h-6 w-6 text-amber-500" />
                            Ranking de Leads
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Top 10 leads mais qualificados do lançamento</p>
                    </div>
                    <Button variant="ghost" className="text-sm text-purple-dark dark:text-purple-light hover:text-purple-700 dark:hover:text-white hover:bg-purple/10">Ver lista completa</Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {topLeads.map((lead, index) => (
                            <div
                                key={lead.id}
                                className="flex items-center justify-between p-6 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-lg
                                        ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                                            index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                                                index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900' : 'bg-muted border text-muted-foreground'}`}
                                    >
                                        {index + 1}
                                    </div>

                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-light to-purple-dark border border-white/20 dark:border-white/10 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                                        {lead.name?.charAt(0).toUpperCase() || '?'}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-semibold text-lg">{lead.name}</p>
                                            {index === 0 && <Trophy className="h-4 w-4 text-amber-500" />}
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground mt-1">
                                            <span>{lead.email}</span>
                                            {lead.whatsapp && (
                                                <>
                                                    <span className="hidden sm:inline opacity-30">•</span>
                                                    <span>{lead.whatsapp}</span>
                                                </>
                                            )}
                                            <span className="hidden sm:inline opacity-30">•</span>
                                            <span>{new Date(lead.timestamp).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right hidden md:block">
                                        <p className="text-2xl font-mono font-bold">{lead.score}</p>
                                        <p className="text-xs text-muted-foreground/70 uppercase tracking-widest">{lead.utm_source || 'Direto'}</p>
                                    </div>
                                    <div className={`rounded-full px-4 py-1.5 text-xs font-bold tracking-wide border
                                        ${lead.segmentation === 'Super Qualificado' ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-transparent shadow-md shadow-green-500/20' :
                                            lead.segmentation === 'Qualificado' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-500/20' :
                                                'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-500 border-red-200 dark:border-red-500/20'}`}
                                    >
                                        {lead.segmentation.toUpperCase()}
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
