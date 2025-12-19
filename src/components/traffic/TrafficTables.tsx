import { useState, useContext } from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { TrafficContext } from '@/context/TrafficContext';
import { PublicDashboardContext } from '@/context/PublicDashboardContext';

export function TrafficTables() {
    const publicContext = useContext(PublicDashboardContext);
    const privateContext = useContext(TrafficContext);
    const context = publicContext || privateContext;

    const [activeTab, setActiveTab] = useState<'campaigns' | 'adsets' | 'ads'>('campaigns');
    const [search, setSearch] = useState('');

    if (!context || context.loading) return null;

    const { campaigns, adSets = [], ads = [] } = context as any;

    const getData = () => {
        let data: any[] = [];
        if (activeTab === 'campaigns') data = campaigns || [];
        if (activeTab === 'adsets') data = adSets || [];
        if (activeTab === 'ads') data = ads || [];

        if (search) {
            data = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
        }
        return data;
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Tabs */}
                <div className="flex bg-muted/30 p-1 rounded-lg">
                    {(['campaigns', 'adsets', 'ads'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                                activeTab === tab
                                    ? "bg-primary text-white shadow-lg shadow-purple/20"
                                    : "text-muted-foreground hover:text-white"
                            )}
                        >
                            {tab === 'campaigns' ? 'Campanhas' : tab === 'adsets' ? 'Conjuntos' : 'Anúncios'}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={`Buscar ${activeTab}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-muted/30 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-white/10 bg-card/30 backdrop-blur-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-4">Nome</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Impr.</th>
                                <th className="px-6 py-4 text-right">Cliques</th>
                                <th className="px-6 py-4 text-right">CTR</th>
                                <th className="px-6 py-4 text-right">Gasto</th>
                                <th className="px-6 py-4 text-right">Leads</th>
                                <th className="px-6 py-4 text-right">CPL</th>
                                <th className="px-6 py-4 text-right">Conv.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {getData().map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground max-w-[200px] truncate" title={item.name}>
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                            item.status === 'active' ? "bg-green-500/20 text-green-400" :
                                                item.status === 'paused' ? "bg-yellow-500/20 text-yellow-400" :
                                                    "bg-gray-500/20 text-gray-400"
                                        )}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">{item.impressions.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">{item.clicks.toLocaleString()}</td>
                                    <td className={cn("px-6 py-4 text-right font-mono", item.ctr > 2 ? "text-green-400" : "text-muted-foreground")}>
                                        {item.ctr.toFixed(2)}%
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-foreground">{formatCurrency(item.spend)}</td>
                                    <td className="px-6 py-4 text-right font-mono text-white font-bold">{item.leads}</td>
                                    <td className={cn("px-6 py-4 text-right font-mono", item.cpl < 20 ? "text-green-400" : item.cpl > 50 ? "text-red-400" : "text-yellow-400")}>
                                        {formatCurrency(item.cpl)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">{item.conversions}</td>
                                </tr>
                            ))}
                            {getData().length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-6 py-10 text-center text-muted-foreground">
                                        Nenhum dado encontrado para esta categoria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
