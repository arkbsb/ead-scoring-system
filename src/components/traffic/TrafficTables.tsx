import { useState, useContext, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { TrafficContext } from '@/context/TrafficContext';
import { PublicDashboardContext } from '@/context/PublicDashboardContext';

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
};

export function TrafficTables() {
    const publicContext = useContext(PublicDashboardContext);
    const privateContext = useContext(TrafficContext);
    const context = publicContext || privateContext;

    const [activeTab, setActiveTab] = useState<'campaigns' | 'adsets' | 'ads'>('campaigns');
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'spend', direction: 'desc' });

    const campaigns = privateContext?.campaigns || publicContext?.campaigns || [];
    const adSets = privateContext?.adSets || publicContext?.adSets || [];
    const ads = privateContext?.ads || publicContext?.ads || [];
    const trafficMapping = privateContext?.trafficMapping;

    const sortedData = useMemo(() => {
        let data: any[] = [];
        if (activeTab === 'campaigns') data = campaigns || [];
        if (activeTab === 'adsets') data = adSets || [];
        if (activeTab === 'ads') data = ads || [];

        if (search) {
            data = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
        }

        if (sortConfig.key) {
            data = [...data].sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return data;
    }, [activeTab, campaigns, adSets, ads, search, sortConfig]);

    const currentCustomFields = useMemo(() => {
        if (!trafficMapping) return [];
        let fields: any[] = [];
        if (activeTab === 'campaigns') fields = trafficMapping.campaigns.mapping.customFields || [];
        if (activeTab === 'adsets') fields = trafficMapping.adSets.mapping.customFields || [];
        if (activeTab === 'ads') fields = trafficMapping.ads.mapping.customFields || [];

        // Filter to only show fields configured for table display
        return fields.filter(cf => cf.displaySection === 'table');
    }, [activeTab, trafficMapping]);

    if (!context || context.loading) return null;

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'desc'; // Default to descending for metrics
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const SortIcon = ({ column }: { column: string }) => {
        if (sortConfig.key !== column) return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground/30" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="ml-2 h-3 w-3 text-primary" />
            : <ArrowDown className="ml-2 h-3 w-3 text-primary" />;
    };

    const SortableHeader = ({ label, column, align = 'left' }: { label: string, column: string, align?: 'left' | 'right' }) => (
        <th
            className={cn(
                "px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors select-none group whitespace-nowrap",
                align === 'right' ? "text-right" : "text-left"
            )}
            onClick={() => requestSort(column)}
        >
            <div className={cn("flex items-center gap-1", align === 'right' && "justify-end")}>
                {label}
                <SortIcon column={column} />
            </div>
        </th>
    );


    return (
        <div className="mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Tabs */}
                <div className="flex bg-muted/30 p-1 rounded-lg">
                    {(['campaigns', 'adsets', 'ads'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setSortConfig({ key: 'spend', direction: 'desc' }); }}
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
                                <SortableHeader label="Nome" column="name" />
                                <SortableHeader label="Impr." column="impressions" align="right" />
                                <SortableHeader label="Cliques" column="clicks" align="right" />
                                <SortableHeader label="CTR" column="ctr" align="right" />
                                <SortableHeader label="Gasto" column="spend" align="right" />
                                <SortableHeader label="Leads" column="leads" align="right" />
                                <SortableHeader label="CPL" column="cpl" align="right" />
                                {currentCustomFields.map(cf => (
                                    <SortableHeader key={cf.key} label={cf.label} column={cf.key} align="right" />
                                ))}
                                <SortableHeader label="Conv." column="conversions" align="right" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedData.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground max-w-[200px] truncate" title={item.name}>
                                        {item.name}
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
                                    {currentCustomFields.map(cf => (
                                        <td key={cf.key} className="px-6 py-4 text-right font-mono text-muted-foreground whitespace-nowrap">
                                            {typeof item[cf.key] === 'number' && !isNaN(item[cf.key])
                                                ? item[cf.key].toLocaleString()
                                                : item[cf.key] || '-'}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">{item.conversions}</td>
                                </tr>
                            ))}
                            {sortedData.length === 0 && (
                                <tr>
                                    <td colSpan={8 + currentCustomFields.length} className="px-6 py-10 text-center text-muted-foreground">
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
