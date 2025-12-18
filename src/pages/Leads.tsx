import { useState, useMemo } from 'react';
import { useLeads } from '@/context/LeadsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Download, Eye, MessageCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Lead, AdvancedFilterState } from '@/lib/types';
import { LeadDetailsModal } from '@/components/LeadDetailsModal';
import { FilterBar } from '@/components/leads/FilterBar';

export function Leads() {
    const { leads } = useLeads();

    // Initial Filter State
    const [filters, setFilters] = useState<AdvancedFilterState>({
        search: '',
        segmentation: 'all',
        minScore: 0,
        maxScore: 1000,
        dateRange: { from: undefined, to: undefined },
        rules: []
    });

    // Extract all unique keys from all leads for the dynamic field selector
    const availableFields = useMemo(() => {
        if (!Array.isArray(leads)) return [];
        const keys = new Set<string>();
        leads.forEach(lead => {
            if (!lead) return;
            Object.keys(lead).forEach(k => keys.add(k));
        });
        return Array.from(keys);
    }, [leads]);

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            // 1. Basic Search
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = !filters.search ||
                lead.name.toLowerCase().includes(searchLower) ||
                lead.email?.toLowerCase().includes(searchLower) ||
                lead.id.toLowerCase().includes(searchLower);

            // 2. Score Range
            const matchesScore = lead.score >= filters.minScore && lead.score <= filters.maxScore;

            // 3. Segmentation
            const matchesSeg = filters.segmentation === 'all' || lead.segmentation === filters.segmentation;

            // 4. Dynamic Rules
            const matchesRules = filters.rules.every(rule => {
                const leadValue = lead[rule.field];
                if (leadValue === undefined || leadValue === null) return false;

                const valString = String(leadValue).toLowerCase();
                const ruleValString = String(rule.value).toLowerCase();

                // Numeric comparison helper
                const numLead = Number(leadValue);
                const numRule = Number(rule.value);
                const isNumeric = !isNaN(numLead) && !isNaN(numRule) && rule.value !== '';

                switch (rule.matchType) {
                    case 'equals':
                        return valString === ruleValString;
                    case 'contains':
                        return valString.includes(ruleValString);
                    case 'starts_with':
                        return valString.startsWith(ruleValString);
                    case 'ends_with':
                        return valString.endsWith(ruleValString);
                    case 'greater_than':
                        return isNumeric ? numLead > numRule : false;
                    case 'less_than':
                        return isNumeric ? numLead < numRule : false;
                    default:
                        return true;
                }
            });

            return matchesSearch && matchesScore && matchesSeg && matchesRules;
        });
    }, [leads, filters]);

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

            <FilterBar
                filters={filters}
                setFilters={setFilters}
                availableFields={availableFields}
            />

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
