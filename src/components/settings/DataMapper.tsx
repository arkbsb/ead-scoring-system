import { useState, useEffect } from 'react';
import { GoogleSheetConfig, ColumnMapping, fetchGoogleSheetData } from '@/lib/google-sheets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lead } from '@/lib/types';
import { Loader2, ChevronDown, AlertCircle } from 'lucide-react';

// Simplified Select for native usage if shadcn components are complex to setup perfectly in one go
// Using standard HTML select with Tailwind classes for robustness

const AVAILABLE_FIELDS: { value: keyof Lead | 'ignore', label: string, isScorable: boolean }[] = [
    { value: 'ignore', label: 'Ignorar Coluna', isScorable: false },
    { value: 'name', label: 'Nome Completo', isScorable: false },
    { value: 'email', label: 'Email', isScorable: false },
    { value: 'whatsapp', label: 'WhatsApp', isScorable: false },
    { value: 'timestamp', label: 'Data/Hora', isScorable: false },

    // Scorable Fields
    { value: 'age', label: 'Idade', isScorable: true },
    { value: 'hasChildren', label: 'Tem Filhos?', isScorable: true },
    { value: 'gender', label: 'Gênero', isScorable: true },
    { value: 'education', label: 'Escolaridade', isScorable: true },
    { value: 'maritalStatus', label: 'Estado Civil', isScorable: true },
    { value: 'hasStore', label: 'Tem Loja?', isScorable: true },
    { value: 'storeType', label: 'Tipo de Loja', isScorable: true },
    { value: 'storeTime', label: 'Tempo de Loja', isScorable: true },
    { value: 'revenue', label: 'Faturamento', isScorable: true },
    { value: 'digitalPresence', label: 'Presença Digital', isScorable: true },
    { value: 'teamStructure', label: 'Equipe', isScorable: true },
    { value: 'sales', label: 'Vendas', isScorable: true },
    { value: 'management', label: 'Gestão', isScorable: true },
    { value: 'difficulty', label: 'Maior Dificuldade', isScorable: true },
    { value: 'dream', label: 'Maior Sonho', isScorable: true },
    { value: 'question', label: 'Dúvida Principal', isScorable: true },
];

export function DataMapper({ config, onSave, onCancel }: { config: GoogleSheetConfig, onSave: (c: GoogleSheetConfig) => void, onCancel: () => void }) {
    const [loading, setLoading] = useState(false);
    // const [headers, setHeaders] = useState<string[]>([]); // Unused
    const [sampleData, setSampleData] = useState<string[][]>([]);
    const [mappings, setMappings] = useState<ColumnMapping[]>(config.mappings || []);
    const [activeScoreColumn, setActiveScoreColumn] = useState<number | null>(null); // rowIndex being edited
    const [error, setError] = useState('');

    useEffect(() => {
        loadSheetData();
    }, []);

    const loadSheetData = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchGoogleSheetData(config);
            if (data.length > 0) {
                const headerRow = data[0];
                // setHeaders(headerRow);
                setSampleData(data.slice(1, 100)); // Keep first 100 rows for unique stats

                // Initialize mappings if empty
                if (!mappings || mappings.length === 0) {
                    const initialMappings = headerRow.map((h, index) => ({
                        rowIndex: index,
                        headerName: h,
                        targetField: 'ignore' as const,
                        scoreRules: []
                    }));
                    setMappings(initialMappings);
                }
            } else {
                setError('Planilha vazia ou ilegível.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (index: number, field: string) => {
        const newMappings = [...mappings];
        newMappings[index] = { ...newMappings[index], targetField: field as any };
        setMappings(newMappings);
    };

    const handleScoreChange = (colIndex: number, value: string, score: string) => {
        const newMappings = [...mappings];
        const currentRules = newMappings[colIndex].scoreRules || [];

        // Check if rule exists
        const existingRuleIndex = currentRules.findIndex(r => r.value === value);
        if (existingRuleIndex >= 0) {
            currentRules[existingRuleIndex].score = Number(score);
        } else {
            currentRules.push({ value, score: Number(score) });
        }

        newMappings[colIndex].scoreRules = currentRules;
        setMappings(newMappings);
    };

    const getUniqueValues = (colIndex: number) => {
        const values = new Set<string>();
        sampleData.forEach(row => {
            if (row[colIndex]) values.add(row[colIndex]);
        });
        return Array.from(values).sort();
    };

    const handleSave = () => {
        const updatedConfig = { ...config, mappings };
        onSave(updatedConfig);
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={onCancel} className="ml-auto">Voltar</Button>
            </div>
        );
    }

    return (
        <Card className="border-primary/20 shadow-lg">
            <CardHeader className="border-b bg-muted/20">
                <CardTitle>Mapeamento de Dados</CardTitle>
                <CardDescription>Vincule as colunas da planilha aos campos do sistema e defina a pontuação.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-muted-foreground font-medium">
                            <tr>
                                <th className="p-4 text-left">Coluna na Planilha</th>
                                <th className="p-4 text-left">Campo no Sistema</th>
                                <th className="p-4 text-left">Pontuação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {mappings.map((map, index) => {
                                const fieldConfig = AVAILABLE_FIELDS.find(f => f.value === map.targetField);
                                return (
                                    <tr key={index} className="hover:bg-muted/10 transition-colors">
                                        <td className="p-4 font-medium text-foreground w-[30%]">
                                            {map.headerName}
                                            <p className="text-xs text-muted-foreground font-mono mt-1 truncate max-w-[200px]">
                                                Ex: {sampleData[0]?.[index] || '-'}
                                            </p>
                                        </td>
                                        <td className="p-4 w-[30%]">
                                            <select
                                                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                value={map.targetField}
                                                onChange={(e) => handleFieldChange(index, e.target.value)}
                                            >
                                                {AVAILABLE_FIELDS.map(f => (
                                                    <option key={f.value} value={f.value}>{f.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            {fieldConfig?.isScorable ? (
                                                <div>
                                                    <Button
                                                        variant={activeScoreColumn === index ? "secondary" : "outline"}
                                                        size="sm"
                                                        onClick={() => setActiveScoreColumn(activeScoreColumn === index ? null : index)}
                                                        className="w-full justify-between"
                                                    >
                                                        {map.scoreRules?.length || 0} Regras
                                                        <ChevronDown className={`h-4 w-4 transition-transform ${activeScoreColumn === index ? 'rotate-180' : ''}`} />
                                                    </Button>

                                                    {activeScoreColumn === index && (
                                                        <div className="mt-2 p-3 bg-muted rounded-lg space-y-2 animate-in slide-in-from-top-2">
                                                            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Atribuir Pontos</p>
                                                            {getUniqueValues(index).map(val => (
                                                                <div key={val} className="flex items-center gap-2">
                                                                    <span className="text-xs flex-1 truncate" title={val}>{val}</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-xs text-muted-foreground">pts:</span>
                                                                        <input
                                                                            type="number"
                                                                            className="w-16 h-7 rounded border border-input px-2 text-xs"
                                                                            value={map.scoreRules?.find(r => r.value === val)?.score || 0}
                                                                            onChange={(e) => handleScoreChange(index, val, e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">Sem pontuação</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t bg-muted/20 flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Mapeamento</Button>
                </div>
            </CardContent>
        </Card>
    );
}
