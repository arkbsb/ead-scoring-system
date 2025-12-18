import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AdvancedFilterState, FilterRule } from '@/lib/types';
import { Plus, Filter, Search, X } from 'lucide-react';
import { GoogleSheetConfig } from '@/lib/google-sheets';

const AVAILABLE_MATCH_TYPES = [
    { value: 'equals', label: 'Igual a' },
    { value: 'contains', label: 'Contém' },
    { value: 'greater_than', label: 'Maior que' },
    { value: 'less_than', label: 'Menor que' },
    { value: 'starts_with', label: 'Começa com' },
    { value: 'ends_with', label: 'Termina com' },
];

interface FilterBarProps {
    filters: AdvancedFilterState;
    setFilters: React.Dispatch<React.SetStateAction<AdvancedFilterState>>;
    availableFields: string[]; // List of Keys from the Lead object (including custom)
    mappingConfig?: GoogleSheetConfig; // To get nice labels if available
}

export function FilterBar({ filters, setFilters, availableFields }: FilterBarProps) {
    const [isExpanded] = useState(true);

    const addRule = () => {
        const newRule: FilterRule = {
            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
            field: 'segmentation',
            matchType: 'equals',
            value: ''
        };
        setFilters(prev => ({
            ...prev,
            rules: [...prev.rules, newRule]
        }));
    };

    const removeRule = (id: string) => {
        setFilters(prev => ({
            ...prev,
            rules: prev.rules.filter(r => r.id !== id)
        }));
    };

    const updateRule = (id: string, updates: Partial<FilterRule>) => {
        setFilters(prev => ({
            ...prev,
            rules: prev.rules.map(r => r.id === id ? { ...r, ...updates } : r)
        }));
    };

    const clearAll = () => {
        setFilters(prev => ({
            ...prev,
            minScore: 0,
            maxScore: 1000,
            search: '',
            segmentation: 'all',
            rules: [],
            dateRange: { from: undefined, to: undefined }
        }));
    };

    return (
        <Card className="shadow-md mb-6 relative overflow-visible z-10">
            <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground hover:text-destructive text-xs">
                    Limpar tudo
                </Button>
            </div>

            <CardContent className="pt-6 space-y-6">
                {/* Top Row: Basic Filters */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                    {/* Search */}
                    <div className="md:col-span-4 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Busca Rápida</label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Nome, Email, ID..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Score Range */}
                    <div className="md:col-span-4 space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            <span>Score</span>
                            <span className="text-foreground">{filters.minScore} - {filters.maxScore}</span>
                        </div>
                        <div className="flex items-center gap-4 px-2">
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={filters.minScore}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setFilters(prev => ({ ...prev, minScore: Math.min(val, prev.maxScore) }))
                                }}
                                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={filters.maxScore}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setFilters(prev => ({ ...prev, maxScore: Math.max(val, prev.minScore) }))
                                }}
                                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>

                    {/* Quick Segmentation */}
                    <div className="md:col-span-4 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={filters.segmentation}
                            onChange={(e) => setFilters(prev => ({ ...prev, segmentation: e.target.value }))}
                        >
                            <option value="all">Todos os Status</option>
                            <option value="Super Qualificado">Super Qualificado</option>
                            <option value="Qualificado">Qualificado</option>
                            <option value="Não Qualificado">Não Qualificado</option>
                        </select>
                    </div>
                </div>

                {/* Dynamic Rules Section */}
                {isExpanded && (
                    <div className="pt-4 border-t border-border space-y-3 animate-accordion-down">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Filter className="h-4 w-4 text-primary" />
                                Filtros Personalizados
                            </h4>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addRule}
                                className="h-8 text-xs gap-1 border-dashed"
                            >
                                <Plus className="h-3 w-3" /> Adicionar Regra
                            </Button>
                        </div>

                        {filters.rules.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic py-2">Nenhum filtro personalizado ativo.</p>
                        ) : (
                            <div className="grid gap-3">
                                {filters.rules.map((rule) => (
                                    <div key={rule.id} className="flex gap-2 items-center bg-muted/30 p-2 rounded-lg border border-border group">

                                        {/* Field Selector */}
                                        <select
                                            className="h-9 w-[200px] rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary"
                                            value={rule.field}
                                            onChange={(e) => updateRule(rule.id, { field: e.target.value })}
                                        >
                                            <optgroup label="Dados Padrão">
                                                <option value="utm_source">Origem (UTM Source)</option>
                                                <option value="utm_medium">Mídia (UTM Medium)</option>
                                                <option value="utm_campaign">Campanha (UTM Campaign)</option>
                                                <option value="age">Idade</option>
                                                <option value="hasChildren">Tem Filhos</option>
                                                <option value="hasStore">Tem Loja</option>
                                                <option value="revenue">Faturamento</option>
                                            </optgroup>
                                            <optgroup label="Todos os Campos">
                                                {availableFields
                                                    .filter(f => !['id', 'score', 'segmentation', 'timestamp'].includes(f))
                                                    .sort()
                                                    .map(field => (
                                                        <option key={field} value={field}>{field}</option>
                                                    ))}
                                            </optgroup>
                                        </select>

                                        {/* Operator Selector */}
                                        <select
                                            className="h-9 w-[150px] rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary"
                                            value={rule.matchType}
                                            onChange={(e) => updateRule(rule.id, { matchType: e.target.value as any })}
                                        >
                                            {AVAILABLE_MATCH_TYPES.map(m => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>

                                        {/* Value Input */}
                                        <Input
                                            className="h-9 flex-1 min-w-[150px]"
                                            placeholder="Valor..."
                                            value={rule.value}
                                            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                                        />

                                        {/* Remove Button */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeRule(rule.id)}
                                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
