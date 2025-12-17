import { useMemo } from 'react';
import { useLeads } from '@/context/LeadsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function Analysis() {
    const { leads } = useLeads();

    const data = useMemo(() => {
        // Segmentation Pie
        const segmentation = [
            { name: 'Super Qualificado', value: leads.filter(l => l.segmentation === 'Super Qualificado').length },
            { name: 'Qualificado', value: leads.filter(l => l.segmentation === 'Qualificado').length },
            { name: 'Não Qualificado', value: leads.filter(l => l.segmentation === 'Não Qualificado').length },
        ].filter(d => d.value > 0);

        // Score by Age
        const ageGroups = Array.from(new Set(leads.map(l => l.age))).sort();
        const scoreByAge = ageGroups.map(age => {
            const groupLeads = leads.filter(l => l.age === age);
            const avg = groupLeads.reduce((acc, l) => acc + l.score, 0) / groupLeads.length;
            return { name: age.split(' ')[0], avg: Math.round(avg) }; // Shorten name
        });

        // Score by Store Type
        const storeTypes = Array.from(new Set(leads.map(l => l.storeType))).filter(Boolean);
        const scoreByStore = storeTypes.map(type => {
            const groupLeads = leads.filter(l => l.storeType === type);
            const avg = groupLeads.reduce((acc, l) => acc + l.score, 0) / groupLeads.length;
            return { name: type, avg: Math.round(avg) };
        });

        // Revenue Distribution
        const revenues = Array.from(new Set(leads.map(l => l.revenue))).filter(Boolean);
        const revenueDist = revenues.map(rev => ({
            name: rev.split(' ')[0] + '...', // Shorten
            count: leads.filter(l => l.revenue === rev).length
        }));

        return { segmentation, scoreByAge, scoreByStore, revenueDist };
    }, [leads]);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Análises Detalhadas</h2>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Segmentação de Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.segmentation}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {data.segmentation.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Score Médio por Idade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.scoreByAge} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                                    <Tooltip />
                                    <Bar dataKey="avg" fill="#8884d8" name="Score Médio" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Score Médio por Tipo de Loja</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.scoreByStore}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" className="text-xs" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="avg" fill="#82ca9d" name="Score Médio" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição por Faturamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.revenueDist}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" className="text-xs" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#ffc658" name="Quantidade" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
