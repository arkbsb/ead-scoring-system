import { useContext } from 'react';
import { TrafficContext } from '@/context/TrafficContext';
import { PublicDashboardContext } from '@/context/PublicDashboardContext';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, ClipboardList, MessageSquare, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TrafficEngagement() {
    const publicContext = useContext(PublicDashboardContext);
    const privateContext = useContext(TrafficContext);
    const context = publicContext || privateContext;

    if (!context || context.loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-44 bg-muted/50 rounded-2xl" />
                ))}
            </div>
        );
    }

    const { kpis } = context;

    // Calculate conversion rates for these specific metrics
    const conversion1a1 = kpis.totalLeads > 0 ? (kpis.totalLeads1a1 / kpis.totalLeads) * 100 : 0;
    const conversionSurvey = kpis.totalLeads > 0 ? (kpis.totalRespondeuPesquisa / kpis.totalLeads) * 100 : 0;
    const conversionMsg = kpis.totalLeads > 0 ? (kpis.totalMandouMsgApi / kpis.totalLeads) * 100 : 0;

    const metrics = [
        {
            title: 'Leads 1a1 (WhatsApp)',
            value: kpis.totalLeads1a1,
            subValue: `${conversion1a1.toFixed(1)}% dos leads totais`,
            description: 'Leads provenientes de disparos oficiais da API',
            icon: MessageCircle,
            color: 'from-indigo-500 to-blue-600',
            shadow: 'shadow-indigo-500/20',
            progress: conversion1a1
        },
        {
            title: 'Respondeu Pesquisa',
            value: kpis.totalRespondeuPesquisa,
            subValue: `${conversionSurvey.toFixed(1)}% dos leads totais`,
            description: 'Leads que preencheram o formulário estratégico',
            icon: ClipboardList,
            color: 'from-rose-500 to-pink-600',
            shadow: 'shadow-rose-500/20',
            progress: conversionSurvey
        },
        {
            title: 'Mandou Mensagem',
            value: kpis.totalMandouMsgApi,
            subValue: `${conversionMsg.toFixed(1)}% dos leads totais`,
            description: 'Etapa final do funil de captação',
            icon: MessageSquare,
            color: 'from-orange-500 to-amber-600',
            shadow: 'shadow-orange-500/20',
            progress: conversionMsg
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold font-display text-white">Engajamento & Conversão WhatsApp</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {metrics.map((metric, i) => (
                    <Card key={i} className="bg-card/40 backdrop-blur-md border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
                        <div className={cn("absolute top-0 left-0 w-1 h-full bg-gradient-to-b", metric.color)} />

                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn("p-3 rounded-2xl bg-gradient-to-br shadow-lg", metric.color, metric.shadow)}>
                                    <metric.icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <h3 className="text-3xl font-bold font-display text-white">
                                        {metric.value.toLocaleString('pt-BR')}
                                    </h3>
                                    <p className="text-xs font-medium text-primary mt-1">
                                        {metric.subValue}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {metric.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        {metric.description}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        <span>Taxa de Conversão</span>
                                        <span>{metric.progress.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", metric.color)}
                                            style={{ width: `${Math.min(metric.progress, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
