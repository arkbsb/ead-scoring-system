import { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings2, RefreshCcw } from 'lucide-react';
import { DashboardConfig, DEFAULT_DASHBOARD_CONFIG } from '@/lib/traffic-types';

export function DashboardCustomizer() {
    const { dashboardConfig, updateDashboardConfig } = useTraffic();
    const [tempConfig, setTempConfig] = useState<DashboardConfig>(dashboardConfig);
    const [open, setOpen] = useState(false);

    const handleSave = async () => {
        await updateDashboardConfig(tempConfig);
        setOpen(false);
    };

    const handleReset = () => {
        setTempConfig(DEFAULT_DASHBOARD_CONFIG);
    };

    const toggleField = (field: keyof DashboardConfig) => {
        setTempConfig(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const items = [
        { id: 'showKPIs', label: 'KPIs Principais', description: 'Geral de Gastos, Leads e CPL' },
        { id: 'showActiveLaunch', label: 'Lançamento Ativo', description: 'Widget de performance do lançamento atual' },
        { id: 'showFunnel', label: 'Funil de Tráfego', description: 'Visualização clássica do funil de conversão' },
        { id: 'showSecondaryMetrics', label: 'Métricas Secundárias', description: 'Engajamento e alcance detalhado' },
        { id: 'showLeadTemperature', label: 'Temperatura de Leads', description: 'Distribuição entre Hot e Cold' },
        { id: 'showBroadcastMetrics', label: 'Métricas de Broadcast', description: 'Status de envios e interações' },
        { id: 'showLandingPagePerformance', label: 'Performance de Landing Pages', description: 'Ranking das melhores páginas' },
        { id: 'showTables', label: 'Tabelas de Dados', description: 'Listagem detalhada de campanhas e anúncios' },
    ];

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (val) setTempConfig(dashboardConfig);
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="bg-muted/10 hover:bg-muted/20 border-muted-foreground/20">
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Customizar Dashboard</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/10 opacity-100 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Personalizar Dashboard</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Escolha quais módulos você deseja ver no seu painel de tráfego.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between space-x-4">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor={item.id} className="font-semibold">{item.label}</Label>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                            <Switch
                                id={item.id}
                                checked={tempConfig[item.id as keyof DashboardConfig]}
                                onCheckedChange={() => toggleField(item.id as keyof DashboardConfig)}
                            />
                        </div>
                    ))}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between items-center mt-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="text-muted-foreground hover:text-foreground gap-2"
                    >
                        <RefreshCcw className="h-3 w-3" />
                        Restaurar Padrão
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Salvar Alterações</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
