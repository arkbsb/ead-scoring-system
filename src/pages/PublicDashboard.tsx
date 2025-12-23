import { useParams } from 'react-router-dom';
import { PublicDashboardProvider, usePublicDashboard } from '@/context/PublicDashboardContext';
import { TrafficFunnel } from '@/components/traffic/TrafficFunnel';
import { TrafficSecondaryMetrics } from '@/components/traffic/TrafficSecondaryMetrics';
import { LeadTemperature } from '@/components/traffic/LeadTemperature';
import { TrafficBroadcastMetrics } from '@/components/traffic/TrafficBroadcastMetrics';
import { LandingPagePerformance } from '@/components/traffic/LandingPagePerformance';
import { TrafficKPIs } from '@/components/traffic/TrafficKPIs';
// import { TrafficCharts } from '@/components/traffic/TrafficCharts';
import { TrafficTables } from '@/components/traffic/TrafficTables';
// import { TrafficEngagement } from '@/components/traffic/TrafficEngagement';
import { Eye, AlertCircle } from 'lucide-react';
import { LaunchPerformanceWidget } from '@/components/launch/LaunchPerformanceWidget';

function PublicDashboardContent() {
    const { loading, error, shareInfo, launch, filteredCampaigns } = usePublicDashboard();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-md">
                    <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold">Link Inválido</h1>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Public Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="container max-w-[1600px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-display font-bold text-foreground">
                                Dashboard de Tráfego Pago
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Visualização pública • Somente leitura
                            </p>
                        </div>
                        {shareInfo && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                    {shareInfo.viewCount} visualizações
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="flex-1 overflow-y-auto bg-background relative scroll-smooth">
                {/* Background Grid Effect */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none"></div>

                <div className="container max-w-[1600px] mx-auto p-6 lg:p-10 relative z-10 animate-fade-in">

                    {/* Data Error State */}
                    {filteredCampaigns.length === 0 && !loading && (
                        <div className="mb-8 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-bold text-yellow-500">Nenhum dado encontrado</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Não foi possível carregar os dados de tráfego. Para visualizar publicamente:
                                    <ul className="list-disc pl-4 mt-2 space-y-1">
                                        <li>
                                            A planilha <strong>PRECISA</strong> estar "Publicada na Web" (não apenas compartilhada).
                                            <br />
                                            <span className="text-xs opacity-80">Vá em: Arquivo &gt; Compartilhar &gt; Publicar na Web &gt; Publicar.</span>
                                        </li>
                                        <li>Verifique se as abas ("Campanhas", "Conjunto de Ads", "Anúncios") mantém esses nomes exatos.</li>
                                    </ul>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-8 pb-10">
                        {/* Summary Metrics */}
                        {/* Summary Metrics - Only show if NO launch */}
                        {!launch && <TrafficKPIs />}

                        {/* Progresso das Metas do Lançamento */}
                        {launch && (
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        🚀 Acompanhamento de Metas: {launch.name}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Acompanhamento em tempo real do investimento, captação e eficiência do lançamento.
                                    </p>
                                </div>
                                <div className="p-6 rounded-xl border border-purple-500/20 bg-purple-500/5 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50" />
                                    <LaunchPerformanceWidget launch={launch} campaigns={filteredCampaigns} />
                                </div>
                            </div>
                        )}

                        <TrafficFunnel />
                        <TrafficSecondaryMetrics />
                        {/* <TrafficCharts /> */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <LeadTemperature />
                            <TrafficBroadcastMetrics />
                        </div>
                        <LandingPagePerformance />
                        <TrafficTables />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-card/30 backdrop-blur-sm mt-16">
                <div className="container max-w-[1600px] mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            Dashboard compartilhado em {shareInfo && new Date(shareInfo.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Powered by <span className="font-semibold text-primary">Lead Scoring System</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export function PublicDashboard() {
    const { token } = useParams<{ token: string }>();

    if (!token) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <h1 className="text-2xl font-bold">Token não fornecido</h1>
                </div>
            </div>
        );
    }

    return (
        <PublicDashboardProvider token={token}>
            <PublicDashboardContent />
        </PublicDashboardProvider>
    );
}
