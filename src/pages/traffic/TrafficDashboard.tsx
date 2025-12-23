import { TrafficProvider, useTraffic } from '@/context/TrafficContext';
import { TrafficFunnel } from '@/components/traffic/TrafficFunnel';
import { TrafficSecondaryMetrics } from '@/components/traffic/TrafficSecondaryMetrics';
import { LeadTemperature } from '@/components/traffic/LeadTemperature';
import { TrafficBroadcastMetrics } from '@/components/traffic/TrafficBroadcastMetrics';
import { LandingPagePerformance } from '@/components/traffic/LandingPagePerformance';
// import { TrafficCharts } from '@/components/traffic/TrafficCharts';
import { TrafficTables } from '@/components/traffic/TrafficTables';
// import { TrafficFilters } from '@/components/traffic/TrafficFilters'; // To be implemented later if needed
import { TrafficSheetConfig } from '@/components/traffic/TrafficSheetConfig';
import { ShareDashboardButton } from '@/components/traffic/ShareDashboardButton';
import { TrafficKPIs } from '@/components/traffic/TrafficKPIs';
// import { TrafficEngagement } from '@/components/traffic/TrafficEngagement';
import { RefreshCw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLaunch } from '@/context/LaunchContext';
import { LaunchPerformanceWidget } from '@/components/launch/LaunchPerformanceWidget';

function DashboardContent() {
    const { refreshData, loading, error, spreadsheetId } = useTraffic();
    const { launches, loading: launchLoading } = useLaunch();
    const activeLaunch = launches.find(l => l.status === 'Ativo');

    if (launchLoading) return null; // Or a skeleton, preventing flicker

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Tráfego Pago</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitoramento de campanhas e performance de ads
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <TrafficSheetConfig />
                    <ShareDashboardButton spreadsheetId={spreadsheetId} />
                    <button
                        onClick={refreshData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-muted/30 hover:bg-muted/50 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-white"
                    >
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        Atualizar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-primary/25">
                        <Download className="h-4 w-4" />
                        Exportar Relatório
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <span className="font-bold">Erro:</span> {error}
                </div>
            )}


            {/* General KPIs - Only show if NO active launch */}
            {!activeLaunch && <TrafficKPIs />}

            {/* Active Launch Widget */}
            {activeLaunch && (
                <div className="mb-8 p-6 rounded-xl border border-purple-500/20 bg-purple-500/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50" />
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Lançamento Ativo: {activeLaunch.name}
                        </h2>
                    </div>
                    <LaunchPerformanceWidget launch={activeLaunch} />
                </div>
            )}

            {/* Main Content */}
            <TrafficFunnel />
            <TrafficSecondaryMetrics />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <LeadTemperature />
                <TrafficBroadcastMetrics />
            </div>
            <LandingPagePerformance />
            {/* <TrafficCharts /> */}
            <TrafficTables />
        </div>
    );
}

export function TrafficDashboard() {
    return (
        <TrafficProvider>
            <DashboardContent />
        </TrafficProvider>
    );
}
