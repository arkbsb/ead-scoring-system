import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Target, Calendar, Wallet, Users, ArrowRight } from 'lucide-react';
import { useLaunch } from '@/context/LaunchContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { differenceInDays, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function LaunchList() {
    const navigate = useNavigate();
    const { launches, deleteLaunch } = useLaunch();

    // Helper to calculate days remaining
    const getDaysRemaining = (end: string) => {
        const days = differenceInDays(parseISO(end), new Date());
        return days > 0 ? days : 0;
    };

    // Helper for progress bar color
    const getProgressColor = (current: number, total: number) => {
        const percentage = total > 0 ? (current / total) * 100 : 0;
        if (percentage >= 90) return 'bg-green-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    return (
        <div className="space-y-8 p-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Meus Lançamentos
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie seus lançamentos e acompanhe suas metas em tempo real.
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/launches/new')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-900/20"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Lançamento
                </Button>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {launches.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground bg-white/5 rounded-xl border border-white/10 border-dashed">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-white mb-2">Nenhum lançamento encontrado</h3>
                        <p className="mb-6">Crie seu primeiro lançamento para começar a rastrear suas metas.</p>
                        <Button variant="outline" onClick={() => navigate('/launches/new')}>
                            Criar Lançamento
                        </Button>
                    </div>
                ) : (
                    launches.map((launch) => {
                        if (!launch.startDate || !launch.endDate) return null;
                        const daysRemaining = getDaysRemaining(launch.endDate);
                        const duration = differenceInDays(parseISO(launch.endDate), parseISO(launch.startDate));

                        return (
                            <Card
                                key={launch.id}
                                className="group relative overflow-hidden bg-black/40 backdrop-blur-xl border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/10 cursor-pointer flex flex-col"
                                onClick={() => navigate(`/launches/${launch.id}`)}
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`text-xs font-bold px-2 py-1 rounded-full border ${launch.status === 'Ativo' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            launch.status === 'Planejamento' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' :
                                                launch.status === 'Finalizado' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            {launch.status}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {daysRemaining > 0 ? `${daysRemaining} dias rest.` : 'Encerrado'}
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl leading-tight group-hover:text-purple-400 transition-colors">
                                        {launch.name}
                                    </CardTitle>
                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                        <span className="bg-white/5 px-2 py-0.5 rounded text-zinc-300">{launch.type}</span>
                                        <span>•</span>
                                        <span>{format(parseISO(launch.startDate), "d 'de' MMM", { locale: ptBR })}</span>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-5 flex-1">
                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Wallet className="h-3 w-3" /> Budget
                                            </div>
                                            <div className="text-sm font-bold text-white">
                                                R$ {launch.totalBudget.toLocaleString('pt-BR')}
                                            </div>
                                            {/* Fake Progress for visual - will be real later */}
                                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-white/30 w-0" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Users className="h-3 w-3" /> Meta Leads
                                            </div>
                                            <div className="text-sm font-bold text-white">
                                                {launch.leadGoal.toLocaleString('pt-BR')}
                                            </div>
                                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-white/30 w-0" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* CPL Info */}
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex justify-between items-center text-xs mb-1">
                                            <span className="text-muted-foreground">CPL Meta (Padrão)</span>
                                            <span className="text-blue-400 font-bold">R$ {launch.cplScenarios.standard.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-muted-foreground opacity-70">
                                            <span>Min: R$ {launch.cplScenarios.aggressive.toFixed(2)}</span>
                                            <span>Max: R$ {launch.cplScenarios.conservative.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-0">
                                    <Button variant="ghost" className="w-full text-xs hover:bg-white/5 hover:text-purple-400 justify-between group-hover:translate-x-1 transition-transform">
                                        Ver Dashboard
                                        <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
