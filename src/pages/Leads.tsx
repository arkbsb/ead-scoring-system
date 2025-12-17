import { useState, useMemo } from 'react';
import { useLeads } from '@/context/LeadsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search, Filter, Eye, MessageCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Lead } from '@/lib/types';
import { LeadDetailsModal } from '@/components/LeadDetailsModal';

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

    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewDetails = (lead: Lead) => {
        setSelectedLead(lead);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-8">
            <div className="flex items-center justify-between">
                {/* Title removed as it is in Topbar, but here we can have module title if preferred, or actions */}
                <h2 className="text-3xl font-bold tracking-tight">Gestão de Leads</h2>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportCSV} className="bg-card hover:bg-muted text-muted-foreground hover:text-foreground">
                        <Download className="mr-2 h-4 w-4" />
                        Excel
                    </Button>
                    <Button variant="outline" onClick={exportPDF} className="bg-card hover:bg-muted text-muted-foreground hover:text-foreground">
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                    </Button>
                </div>
            </div>

            <Card className="shadow-lg">
                <CardHeader className="border-b pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-mint-dark dark:text-mint" />
                        Filtros Avançados
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Busca</label>
                            <div className="relative group">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-mint-dark dark:group-focus-within:text-mint transition-colors" />
                                <Input
                                    placeholder="Nome ou Email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 bg-background border-input placeholder:text-muted-foreground/50 focus:border-mint-dark focus:ring-mint-dark/20 dark:focus:border-mint dark:focus:ring-mint/20"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Segmentação</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-dark/50 dark:focus-visible:ring-mint/50"
                                value={segmentation}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSegmentation(e.target.value)}
                            >
                                <option value="all">Todos os Status</option>
                                <option value="Super Qualificado">Super Qualificado</option>
                                <option value="Qualificado">Qualificado</option>
                                <option value="Não Qualificado">Não Qualificado</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">min score: <span className="text-foreground">{minScore}</span></label>
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={minScore}
                                onChange={(e) => setMinScore(Number(e.target.value))}
                                className="w-full accent-mint-dark dark:accent-mint cursor-pointer"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">max score: <span className="text-foreground">{maxScore}</span></label>
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={maxScore}
                                onChange={(e) => setMaxScore(Number(e.target.value))}
                                className="w-full accent-mint-dark dark:accent-mint cursor-pointer"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-lg overflow-hidden">
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b [&_tr]:border-border bg-muted/50">
                                <tr className="border-b transition-colors data-[state=selected]:bg-muted">
                                    <th className="h-12 px-6 align-middle font-medium text-muted-foreground">Nome</th>
                                    <th className="h-12 px-6 align-middle font-medium text-muted-foreground">Score</th>
                                    <th className="h-12 px-6 align-middle font-medium text-muted-foreground">Segmentação</th>
                                    <th className="h-12 px-6 align-middle font-medium text-muted-foreground">WhatsApp</th>
                                    <th className="h-12 px-6 align-middle font-medium text-muted-foreground">Idade</th>
                                    <th className="h-12 px-6 align-middle font-medium text-muted-foreground">Tem Loja</th>
                                    <th className="h-12 px-6 align-middle font-medium text-muted-foreground">Faturamento</th>
                                    <th className="h-12 px-6 align-middle font-medium text-muted-foreground text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-6 align-middle font-medium text-foreground">{lead.name}</td>
                                        <td className="p-6 align-middle font-bold text-mint-dark dark:text-mint font-mono">{lead.score}</td>
                                        <td className="p-6 align-middle">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide border ${lead.segmentation === 'Super Qualificado' ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-transparent shadow-md shadow-green-500/20' :
                                                lead.segmentation === 'Qualificado' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-500/20' :
                                                    'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-500 border-red-200 dark:border-red-500/20'
                                                }`}>
                                                {lead.segmentation}
                                            </span>
                                        </td>
                                        <td className="p-6 align-middle text-muted-foreground">{lead.whatsapp}</td>
                                        <td className="p-6 align-middle text-muted-foreground">{lead.age}</td>
                                        <td className="p-6 align-middle text-muted-foreground">{lead.hasStore}</td>
                                        <td className="p-6 align-middle text-muted-foreground">{lead.revenue}</td>
                                        <td className="p-6 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {lead.whatsapp && (
                                                    <a
                                                        href={`https://api.whatsapp.com/send/?phone=55${String(lead.whatsapp).replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`${buttonVariants({ variant: 'ghost', size: 'icon' })} hover:bg-emerald-100 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors`}
                                                        title="Iniciar Conversa WhatsApp"
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                    </a>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleViewDetails(lead)}
                                                    className="hover:bg-primary/10 hover:text-primary transition-colors"
                                                    title="Ver Detalhes"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                <div className="p-4 border-t bg-muted/20 text-sm text-muted-foreground flex justify-between items-center">
                    <span>Mostrando <span className="text-foreground font-medium">{filteredLeads.length}</span> de {leads.length} leads</span>
                </div>
            </Card>

            <LeadDetailsModal
                lead={selectedLead}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
