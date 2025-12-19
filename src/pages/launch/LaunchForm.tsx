import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLaunch } from '@/context/LaunchContext';
import { useTraffic } from '@/context/TrafficContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Save, ArrowLeft, Target, Wallet, TrendingUp, Link as LinkIcon, AlertCircle, Rocket } from 'lucide-react';
import { Launch, LaunchType, LaunchStatus, CplScenario } from '@/lib/launch-types';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

export default function LaunchForm() {
    const navigate = useNavigate();
    const { addLaunch } = useLaunch();
    const { campaigns } = useTraffic(); // For linking campaigns

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<LaunchType>('Desafio');
    const [status, setStatus] = useState<LaunchStatus>('Planejamento');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Budget & Goals
    const [totalBudget, setTotalBudget] = useState<number>(0);
    const [leadGoal, setLeadGoal] = useState<number>(0);

    // CPL Scenarios
    const [autoCalcCpl, setAutoCalcCpl] = useState(true);
    const [cplScenarios, setCplScenarios] = useState<CplScenario>({
        aggressive: 0,
        standard: 0,
        conservative: 0
    });

    // Conversions
    const [enableConversionGoals, setEnableConversionGoals] = useState(false);
    const [conversionGoal, setConversionGoal] = useState<number>(0);
    const [averageTicket, setAverageTicket] = useState<number>(0);

    // Linked Campaigns
    const [linkedCampaignIds, setLinkedCampaignIds] = useState<string[]>([]);

    // --- Effects & Calculations ---

    // Auto-calculate CPL Scenarios when Budget/Leads change
    useEffect(() => {
        if (autoCalcCpl && totalBudget > 0 && leadGoal > 0) {
            const standard = totalBudget / leadGoal;
            setCplScenarios({
                standard: Number(standard.toFixed(2)),
                aggressive: Number((standard * 0.7).toFixed(2)), // 30% less
                conservative: Number((standard * 1.3).toFixed(2)) // 30% more
            });
        }
    }, [totalBudget, leadGoal, autoCalcCpl]);

    // Derived Metrics
    const duration = startDate && endDate
        ? differenceInDays(parseISO(endDate), parseISO(startDate))
        : 0;

    const projectedLeads = {
        aggressive: cplScenarios.aggressive > 0 ? Math.floor(totalBudget / cplScenarios.aggressive) : 0,
        standard: cplScenarios.standard > 0 ? Math.floor(totalBudget / cplScenarios.standard) : 0,
        conservative: cplScenarios.conservative > 0 ? Math.floor(totalBudget / cplScenarios.conservative) : 0,
    };

    const conversionMetrics = {
        rate: leadGoal > 0 ? (conversionGoal / leadGoal) * 100 : 0,
        revenue: conversionGoal * averageTicket,
        roas: totalBudget > 0 ? (conversionGoal * averageTicket) / totalBudget : 0,
        roi: totalBudget > 0 ? (((conversionGoal * averageTicket) - totalBudget) / totalBudget) * 100 : 0
    };

    // --- Handlers ---

    const handleSave = async () => {
        if (!name || !startDate || !endDate || totalBudget <= 0 || leadGoal <= 0) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const launchData: Omit<Launch, 'id' | 'createdAt' | 'updatedAt'> = {
            name,
            description,
            type,
            status,
            startDate,
            endDate,
            totalBudget,
            leadGoal,
            cplScenarios,
            conversionGoal: enableConversionGoals ? conversionGoal : undefined,
            averageTicket: enableConversionGoals ? averageTicket : undefined,
            linkedCampaignIds
        };

        try {
            await addLaunch(launchData);
            navigate('/launches');
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar lançamento. Verifique o console ou se você está logado.");
        }
    };

    const toggleCampaignParams = (id: string) => {
        setLinkedCampaignIds(prev =>
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/launches')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Novo Lançamento
                    </h1>
                    <p className="text-muted-foreground">Planeje suas metas e acompanhe a performance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Main Form */}
                <div className="md:col-span-2 space-y-8">

                    {/* 1. Basic Info */}
                    <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Rocket className="h-5 w-5 text-purple-400" />
                                Informações Básicas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome do Lançamento *</Label>
                                <Input
                                    placeholder="Ex: Desafio Ano Novo 2026"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo</Label>
                                    <select
                                        className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm"
                                        value={type}
                                        onChange={(e) => setType(e.target.value as LaunchType)}
                                    >
                                        <option value="Webinar">Webinar</option>
                                        <option value="Masterclass">Masterclass</option>
                                        <option value="Mentoria">Mentoria</option>
                                        <option value="Curso">Curso Online</option>
                                        <option value="Desafio">Desafio</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <select
                                        className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as LaunchStatus)}
                                    >
                                        <option value="Planejamento">Planejamento</option>
                                        <option value="Ativo">Ativo</option>
                                        <option value="Pausado">Pausado</option>
                                        <option value="Finalizado">Finalizado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Descrição (Opcional)</Label>
                                <Input
                                    placeholder="Objetivos e detalhes..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Period & Budget */}
                    <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-400" />
                                Período e Investimento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Início *</Label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="bg-white/5 border-white/10 block"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fim *</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="bg-white/5 border-white/10 block"
                                    />
                                </div>
                            </div>

                            {duration > 0 && (
                                <div className="text-xs text-muted-foreground flex gap-4 bg-white/5 p-3 rounded-lg">
                                    <span>⏱️ Duração: {duration} dias</span>
                                    <span>📅 Término: {endDate}</span>
                                </div>
                            )}

                            <div className="pt-2 border-t border-white/10">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Wallet className="h-4 w-4" />
                                        Investimento Total Planejado (Budget) *
                                    </Label>
                                    <Input
                                        type="number"
                                        placeholder="R$ 0,00"
                                        value={totalBudget || ''}
                                        onChange={e => setTotalBudget(parseFloat(e.target.value))}
                                        className="bg-white/5 border-white/10 text-lg font-mono text-green-400"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Goals & Scenarios */}
                    <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-red-400" />
                                Metas de Lead e Cenários
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Meta de Leads Total *</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={leadGoal || ''}
                                    onChange={e => setLeadGoal(parseInt(e.target.value))}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Cenários de CPL (Custo Por Lead)</Label>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Checkbox
                                            id="autoCpl"
                                            checked={autoCalcCpl}
                                            onCheckedChange={(checked) => setAutoCalcCpl(checked as boolean)}
                                        />
                                        <label htmlFor="autoCpl">Calcular automaticamente</label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {/* Aggressive */}
                                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 space-y-2">
                                        <div className="flex items-center gap-2 text-green-400 font-medium text-xs uppercase">
                                            <Rocket className="h-3 w-3" /> Agressivo
                                        </div>
                                        <Input
                                            type="number"
                                            value={cplScenarios.aggressive || ''}
                                            disabled={autoCalcCpl}
                                            onChange={e => setCplScenarios({ ...cplScenarios, aggressive: parseFloat(e.target.value) })}
                                            className="h-8 bg-black/20 border-green-500/30 text-green-400 font-mono"
                                        />
                                        <p className="text-[10px] text-green-400/70">
                                            Meta: {projectedLeads.aggressive.toLocaleString()} leads
                                        </p>
                                    </div>

                                    {/* Standard */}
                                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-2">
                                        <div className="flex items-center gap-2 text-blue-400 font-medium text-xs uppercase">
                                            <Target className="h-3 w-3" /> Padrão
                                        </div>
                                        <Input
                                            type="number"
                                            value={cplScenarios.standard || ''}
                                            disabled={autoCalcCpl}
                                            onChange={e => setCplScenarios({ ...cplScenarios, standard: parseFloat(e.target.value) })}
                                            className="h-8 bg-black/20 border-blue-500/30 text-blue-400 font-mono"
                                        />
                                        <p className="text-[10px] text-blue-400/70">
                                            Meta: {projectedLeads.standard.toLocaleString()} leads
                                        </p>
                                    </div>

                                    {/* Conservative */}
                                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 space-y-2">
                                        <div className="flex items-center gap-2 text-yellow-400 font-medium text-xs uppercase">
                                            <AlertCircle className="h-3 w-3" /> Conservador
                                        </div>
                                        <Input
                                            type="number"
                                            value={cplScenarios.conservative || ''}
                                            disabled={autoCalcCpl}
                                            onChange={e => setCplScenarios({ ...cplScenarios, conservative: parseFloat(e.target.value) })}
                                            className="h-8 bg-black/20 border-yellow-500/30 text-yellow-400 font-mono"
                                        />
                                        <p className="text-[10px] text-yellow-400/70">
                                            Meta: {projectedLeads.conservative.toLocaleString()} leads
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Conversion Goals (Optional) */}
                    <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                                    Metas de Conversão (Vendas)
                                </div>
                                <div className="flex items-center gap-2 text-sm font-normal">
                                    <span className="text-muted-foreground">Definir metas?</span>
                                    <Checkbox
                                        checked={enableConversionGoals}
                                        onCheckedChange={(c) => setEnableConversionGoals(c as boolean)}
                                    />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        {enableConversionGoals && (
                            <CardContent className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Meta de Vendas (Qtd)</Label>
                                        <Input
                                            type="number"
                                            value={conversionGoal || ''}
                                            onChange={e => setConversionGoal(parseInt(e.target.value))}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ticket Médio (R$)</Label>
                                        <Input
                                            type="number"
                                            value={averageTicket || ''}
                                            onChange={e => setAverageTicket(parseFloat(e.target.value))}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-white/5 rounded-lg space-y-3">
                                    <h4 className="text-xs uppercase font-medium text-muted-foreground mb-2">Projeção de Resultado</h4>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <div className="text-muted-foreground">Taxa Conv. Necessária:</div>
                                        <div className="text-right font-mono">{conversionMetrics.rate.toFixed(1)}%</div>

                                        <div className="text-muted-foreground">Receita Estimada:</div>
                                        <div className="text-right font-mono text-emerald-400">R$ {conversionMetrics.revenue.toLocaleString()}</div>

                                        <div className="text-muted-foreground">ROAS Meta:</div>
                                        <div className="text-right font-mono">{conversionMetrics.roas.toFixed(2)}x</div>

                                        <div className="text-muted-foreground">ROI Meta:</div>
                                        <div className="text-right font-mono">{conversionMetrics.roi.toFixed(0)}%</div>
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* 5. Campaign Linking */}
                    <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LinkIcon className="h-5 w-5 text-orange-400" />
                                Vincular Campanhas
                            </CardTitle>
                            <CardDescription>
                                Selecione as campanhas do Google Sheets para rastrear neste lançamento.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border border-white/10 rounded-lg max-h-60 overflow-y-auto">
                                {campaigns.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground text-sm">
                                        Nenhuma campanha encontrada. Conecte sua planilha no Dashboard de Tráfego primeiro.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/10">
                                        {campaigns.map(campaign => (
                                            <div key={campaign.id} className="flex items-center p-3 hover:bg-white/5 transition-colors">
                                                <Checkbox
                                                    id={`cmp-${campaign.id}`}
                                                    checked={linkedCampaignIds.includes(campaign.id)}
                                                    onCheckedChange={() => toggleCampaignParams(campaign.id)}
                                                />
                                                <label htmlFor={`cmp-${campaign.id}`} className="ml-3 flex-1 cursor-pointer text-sm">
                                                    <span className="block font-medium text-white">{campaign.name}</span>
                                                    <span className="block text-xs text-muted-foreground">
                                                        {campaign.status} • Budget: {campaign.spend.toLocaleString()}
                                                    </span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {linkedCampaignIds.length} campanhas selecionadas
                            </p>
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column - Summary & Actions (Sticky) */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-b from-purple-900/20 to-black/40 border-purple-500/20 sticky top-6">
                        <CardHeader>
                            <CardTitle>Resumo do Plano</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase">Meta de Leads</span>
                                    <div className="text-2xl font-bold">{leadGoal.toLocaleString()}</div>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase">Budget Total</span>
                                    <div className="text-2xl font-bold text-green-400">R$ {totalBudget.toLocaleString()}</div>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <span className="text-xs text-muted-foreground uppercase">CPL Alvo (Padrão)</span>
                                    <div className="text-3xl font-bold text-blue-400">
                                        R$ {cplScenarios.standard > 0 ? cplScenarios.standard.toFixed(2) : '0,00'}
                                    </div>
                                    <div className="flex justify-between text-xs mt-2 text-muted-foreground">
                                        <span>Min: R$ {cplScenarios.aggressive.toFixed(2)}</span>
                                        <span>Max: R$ {cplScenarios.conservative.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleSave} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6">
                                <Save className="mr-2 h-5 w-5" />
                                Salvar Lançamento
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
