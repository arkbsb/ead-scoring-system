import { useState, useMemo } from 'react';
import { useLeads } from '@/context/LeadsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Need to create
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Leads() {
    const { leads } = useLeads();
    const [search, setSearch] = useState('');
    const [minScore, setMinScore] = useState(0);
    const [maxScore, setMaxScore] = useState(1000);
    const [segmentation, setSegmentation] = useState<string>('all');

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) ||
                lead.id.toLowerCase().includes(search.toLowerCase());
            const matchesScore = lead.score >= minScore && lead.score <= maxScore;
            const matchesSeg = segmentation === 'all' || lead.segmentation === segmentation;

            return matchesSearch && matchesScore && matchesSeg;
        });
    }, [leads, search, minScore, maxScore, segmentation]);

    const exportCSV = () => {
        const ws = XLSX.utils.json_to_sheet(filteredLeads);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Leads");
        XLSX.writeFile(wb, "leads.xlsx");
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [['Nome', 'Score', 'Segmentação', 'Email', 'WhatsApp', 'Idade']],
            body: filteredLeads.map(l => [l.name, l.score, l.segmentation, l.email || '', l.whatsapp || '', l.age]),
        });
        doc.save('leads.pdf');
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        Excel
                    </Button>
                    <Button variant="outline" onClick={exportPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <label className="text-sm font-medium">Busca</label>
                            <Input
                                placeholder="Nome ou Email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Segmentação</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={segmentation}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSegmentation(e.target.value)}
                            >
                                <option value="all">Todos</option>
                                <option value="Quente">Quente</option>
                                <option value="Morno">Morno</option>
                                <option value="Frio">Frio</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Score Mínimo: {minScore}</label>
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={minScore}
                                onChange={(e) => setMinScore(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Score Máximo: {maxScore}</label>
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={maxScore}
                                onChange={(e) => setMaxScore(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nome</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Score</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Segmentação</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">WhatsApp</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Idade</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tem Loja</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Faturamento</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium">{lead.name}</td>
                                        <td className="p-4 align-middle font-bold text-primary">{lead.score}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${lead.segmentation === 'Quente' ? 'bg-green-100 text-green-800' :
                                                lead.segmentation === 'Morno' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {lead.segmentation}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">{lead.whatsapp}</td>
                                        <td className="p-4 align-middle">{lead.age}</td>
                                        <td className="p-4 align-middle">{lead.hasStore}</td>
                                        <td className="p-4 align-middle">{lead.revenue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 text-sm text-muted-foreground">
                        Mostrando {filteredLeads.length} de {leads.length} leads
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
