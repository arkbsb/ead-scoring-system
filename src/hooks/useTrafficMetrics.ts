import { useMemo, useContext } from 'react';
import { TrafficContext } from '@/context/TrafficContext';
import { PublicDashboardContext } from '@/context/PublicDashboardContext';
import { MetricItem } from '@/lib/traffic-types';
import { aggregateCustomField, formatCustomValue } from '@/lib/aggregation-utils';
import { getIcon, getColorClasses } from '@/lib/icon-utils';
import { DollarSign, Users, TrendingDown } from 'lucide-react';

export function useTrafficMetrics() {
    const publicContext = useContext(PublicDashboardContext);
    const privateContext = useContext(TrafficContext);
    const context = publicContext || privateContext;

    const customKPIs = useMemo<MetricItem[]>(() => {
        if (!context?.trafficMapping) {
            return [];
        }

        const customFields = context.trafficMapping.campaigns.mapping.customFields || [];
        const kpiFields = customFields.filter(cf => cf.displaySection === 'kpis');

        return kpiFields.map(field => {
            const aggregatedValue = aggregateCustomField(context.filteredCampaigns, field);
            const formattedValue = formatCustomValue(aggregatedValue, field.format);
            const Icon = getIcon(field.icon);
            const colors = getColorClasses(field.color);

            return {
                label: field.label,
                value: formattedValue,
                icon: Icon,
                color: colors.text,
                bg: colors.bg,
            };
        });
    }, [context]);

    const standardMetrics = useMemo<MetricItem[]>(() => {
        if (!context?.kpis) return [];
        const { kpis } = context;

        return [
            {
                label: 'Investimento Total',
                value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.totalSpend),
                icon: DollarSign,
                color: 'text-purple-400',
                bg: 'bg-purple-400/10',
                change: '+12%',
                changeColor: 'text-green-500'
            },
            {
                label: 'Leads Gerados',
                value: kpis.totalLeads.toLocaleString('pt-BR'),
                icon: Users,
                color: 'text-blue-400',
                bg: 'bg-blue-400/10',
                change: '+5%',
                changeColor: 'text-green-500'
            },
            {
                label: 'CPL Médio',
                value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.averageCpl),
                icon: TrendingDown,
                color: 'text-green-400',
                bg: 'bg-green-400/10',
                change: '-2%',
                changeColor: 'text-green-500'
            }
        ];
    }, [context]);

    return { customKPIs, standardMetrics, loading: context?.loading || false };
}
