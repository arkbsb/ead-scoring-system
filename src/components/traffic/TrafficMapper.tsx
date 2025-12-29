import React, { useState } from 'react';
import { useTraffic } from '@/context/TrafficContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Columns, Plus, Trash2, Save, Info } from 'lucide-react';
import { TrafficMapping, ColumnMapping, CustomField, DisplaySection, AggregationType, FormatType } from '@/lib/traffic-types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDisplaySectionLabel, getAggregationLabel, getFormatLabel } from '@/lib/aggregation-utils';
import { ICON_OPTIONS, COLOR_PRESETS, getIcon, getColorClasses } from '@/lib/icon-utils';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MappingSectionProps {
    title: string;
    section: keyof TrafficMapping;
    tempMapping: TrafficMapping;
    updateColumn: (section: keyof TrafficMapping, field: keyof ColumnMapping, value: string) => void;
    updateSheetName: (section: keyof TrafficMapping, value: string) => void;
    addCustomField: (section: keyof TrafficMapping) => void;
    updateCustomField: (section: keyof TrafficMapping, key: string, updates: Partial<CustomField>) => void;
    removeCustomField: (section: keyof TrafficMapping, key: string) => void;
}

const MappingSection = ({
    title,
    section,
    tempMapping,
    updateColumn,
    updateSheetName,
    addCustomField,
    updateCustomField,
    removeCustomField
}: MappingSectionProps) => {
    const m = tempMapping[section].mapping;
    return (
        <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/5">
            <div className="flex items-center justify-between border-b pb-2 mb-2">
                <h4 className="font-bold text-sm uppercase text-muted-foreground">{title}</h4>
                <div className="flex items-center gap-2">
                    <Label className="text-[10px] whitespace-nowrap">Aba:</Label>
                    <Input
                        className="h-7 text-xs w-32"
                        value={tempMapping[section].sheetName}
                        onChange={(e) => updateSheetName(section, e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="space-y-1">
                    <Label className="text-xs">Nome</Label>
                    <Input type="number" className="h-8" value={m.nameIndex} onChange={(e) => updateColumn(section, 'nameIndex', e.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Gasto (Spend)</Label>
                    <Input type="number" className="h-8" value={m.spendIndex} onChange={(e) => updateColumn(section, 'spendIndex', e.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Leads</Label>
                    <Input type="number" className="h-8" value={m.leadsIndex} onChange={(e) => updateColumn(section, 'leadsIndex', e.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Impressões</Label>
                    <Input type="number" className="h-8" value={m.impressionsIndex} onChange={(e) => updateColumn(section, 'impressionsIndex', e.target.value)} />
                </div>
            </div>

            {/* Custom Fields */}
            <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-semibold">Campos Customizados</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => addCustomField(section)}>
                        <Plus className="h-3 w-3 mr-1" /> Add Campo
                    </Button>
                </div>
                <div className="space-y-3">
                    {m.customFields?.map(cf => (
                        <CustomFieldEditor
                            key={cf.key}
                            field={cf}
                            onUpdate={(updates) => updateCustomField(section, cf.key, updates)}
                            onRemove={() => removeCustomField(section, cf.key)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export function TrafficMapper() {
    const { trafficMapping, updateTrafficMapping } = useTraffic();
    const [tempMapping, setTempMapping] = useState<TrafficMapping>(trafficMapping);
    const [open, setOpen] = useState(false);

    // Sync tempMapping when trafficMapping changes from context
    React.useEffect(() => {
        if (open) {
            setTempMapping(trafficMapping);
        }
    }, [trafficMapping, open]);

    const handleSave = async () => {
        await updateTrafficMapping(tempMapping);
        // Don't close immediately - wait for context to update
        setTimeout(() => {
            setOpen(false);
        }, 100);
    };

    const updateColumn = (section: keyof TrafficMapping, field: keyof ColumnMapping, value: string) => {
        const numValue = parseInt(value);
        if (isNaN(numValue)) return;

        setTempMapping(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                mapping: {
                    ...prev[section].mapping,
                    [field]: numValue
                }
            }
        }));
    };

    const updateSheetName = (section: keyof TrafficMapping, value: string) => {
        setTempMapping(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                sheetName: value
            }
        }));
    };

    const addCustomField = (section: keyof TrafficMapping) => {
        const key = `custom_${Date.now()}`;
        const newField: CustomField = {
            key,
            label: 'Novo Campo',
            index: 0,
            displaySection: 'table',
            aggregation: 'sum',
            format: 'number',
            icon: 'BarChart3',
            color: 'purple'
        };

        setTempMapping(prev => {
            const current = prev[section].mapping.customFields || [];
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    mapping: {
                        ...prev[section].mapping,
                        customFields: [...current, newField]
                    }
                }
            };
        });
    };

    const removeCustomField = (section: keyof TrafficMapping, key: string) => {
        setTempMapping(prev => {
            const current = prev[section].mapping.customFields || [];
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    mapping: {
                        ...prev[section].mapping,
                        customFields: current.filter(cf => cf.key !== key)
                    }
                }
            };
        });
    };

    const updateCustomField = (
        section: keyof TrafficMapping,
        key: string,
        updates: Partial<CustomField>
    ) => {
        setTempMapping(prev => {
            const current = prev[section].mapping.customFields || [];
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    mapping: {
                        ...prev[section].mapping,
                        customFields: current.map(cf => {
                            if (cf.key === key) {
                                return { ...cf, ...updates };
                            }
                            return cf;
                        })
                    }
                }
            };
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (val) setTempMapping(trafficMapping);
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="bg-muted/10 hover:bg-muted/20 border-muted-foreground/20" title="Mapeamento de Colunas">
                    <Columns className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Mapear Colunas</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-slate-900 border-border opacity-100 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Columns className="h-5 w-5 text-primary" />
                        Mapeamento da Planilha
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Configure os nomes das abas, índices das colunas e campos customizados com posicionamento flexível
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-6 py-4">
                    <MappingSection
                        title="Campanhas"
                        section="campaigns"
                        tempMapping={tempMapping}
                        updateColumn={updateColumn}
                        updateSheetName={updateSheetName}
                        addCustomField={addCustomField}
                        updateCustomField={updateCustomField}
                        removeCustomField={removeCustomField}
                    />
                    <MappingSection
                        title="Conjuntos"
                        section="adSets"
                        tempMapping={tempMapping}
                        updateColumn={updateColumn}
                        updateSheetName={updateSheetName}
                        addCustomField={addCustomField}
                        updateCustomField={updateCustomField}
                        removeCustomField={removeCustomField}
                    />
                    <MappingSection
                        title="Anúncios"
                        section="ads"
                        tempMapping={tempMapping}
                        updateColumn={updateColumn}
                        updateSheetName={updateSheetName}
                        addCustomField={addCustomField}
                        updateCustomField={updateCustomField}
                        removeCustomField={removeCustomField}
                    />
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded-lg flex gap-3 mb-4">
                    <Info className="h-5 w-5 text-blue-400 shrink-0" />
                    <p className="text-[11px] text-blue-200/80 leading-relaxed">
                        <strong>Dica:</strong> Campos customizados podem ser exibidos em diferentes seções do dashboard.
                        Escolha onde cada métrica deve aparecer e como deve ser agregada e formatada.
                    </p>
                </div>

                <DialogFooter className="flex justify-between items-center bg-muted/20 -mx-6 -mb-6 p-4 border-t mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" /> Salvar Configurações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CustomFieldEditor({
    field,
    onUpdate,
    onRemove
}: {
    field: CustomField;
    onUpdate: (updates: Partial<CustomField>) => void;
    onRemove: () => void;
}) {
    const Icon = getIcon(field.icon);
    const colors = getColorClasses(field.color);

    return (
        <Card className="border-border bg-muted/10">
            <CardContent className="p-3 space-y-3">
                {/* Preview */}
                <div className={cn("p-3 rounded-lg flex items-center gap-3", colors.bg)}>
                    <div className={cn("p-2 rounded-lg bg-background/50")}>
                        <Icon className={cn("h-4 w-4", colors.text)} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase">Preview</p>
                        <p className={cn("font-bold", colors.text)}>{field.label || 'Novo Campo'}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove}>
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>

                {/* Configuration */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Rótulo</Label>
                        <Input
                            className="h-8 text-xs"
                            placeholder="Ex: Vendas, ROAS..."
                            value={field.label}
                            onChange={(e) => onUpdate({ label: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Índice da Coluna</Label>
                        <Input
                            type="number"
                            className="h-8 text-xs"
                            value={field.index}
                            onChange={(e) => onUpdate({ index: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Exibir em</Label>
                        <Select value={field.displaySection} onValueChange={(v) => onUpdate({ displaySection: v as DisplaySection })}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="kpis">{getDisplaySectionLabel('kpis')}</SelectItem>
                                <SelectItem value="secondary">{getDisplaySectionLabel('secondary')}</SelectItem>
                                <SelectItem value="sources">{getDisplaySectionLabel('sources')}</SelectItem>
                                <SelectItem value="table">{getDisplaySectionLabel('table')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Agregação</Label>
                        <Select value={field.aggregation} onValueChange={(v) => onUpdate({ aggregation: v as AggregationType })}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sum">{getAggregationLabel('sum')}</SelectItem>
                                <SelectItem value="avg">{getAggregationLabel('avg')}</SelectItem>
                                <SelectItem value="max">{getAggregationLabel('max')}</SelectItem>
                                <SelectItem value="min">{getAggregationLabel('min')}</SelectItem>
                                <SelectItem value="count">{getAggregationLabel('count')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Formato</Label>
                        <Select value={field.format} onValueChange={(v) => onUpdate({ format: v as FormatType })}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="currency">{getFormatLabel('currency')}</SelectItem>
                                <SelectItem value="number">{getFormatLabel('number')}</SelectItem>
                                <SelectItem value="percentage">{getFormatLabel('percentage')}</SelectItem>
                                <SelectItem value="text">{getFormatLabel('text')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Ícone</Label>
                        <Select value={field.icon} onValueChange={(v) => onUpdate({ icon: v })}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ICON_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Cor</Label>
                        <Select value={field.color} onValueChange={(v) => onUpdate({ color: v })}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {COLOR_PRESETS.map(color => (
                                    <SelectItem key={color.value} value={color.value}>
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-3 h-3 rounded-full", color.bg, color.text)} />
                                            {color.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
