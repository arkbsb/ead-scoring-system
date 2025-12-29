import { Campaign, AdSet, Ad, CustomField, AggregationType, FormatType } from './traffic-types';

/**
 * Aggregate a custom field across multiple entities
 */
export function aggregateCustomField(
    entities: (Campaign | AdSet | Ad)[],
    field: CustomField
): number | string {
    if (entities.length === 0) return 0;

    const values = entities
        .map(entity => entity[field.key])
        .filter(val => val !== undefined && val !== null && val !== '');

    if (values.length === 0) return 0;

    switch (field.aggregation) {
        case 'sum':
            return values.reduce((acc, val) => acc + (Number(val) || 0), 0);

        case 'avg':
            const sum = values.reduce((acc, val) => acc + (Number(val) || 0), 0);
            return sum / values.length;

        case 'max':
            return Math.max(...values.map(v => Number(v) || 0));

        case 'min':
            return Math.min(...values.map(v => Number(v) || 0));

        case 'count':
            return values.length;

        case 'first':
            return values[0];

        default:
            return 0;
    }
}

/**
 * Format a value based on the specified format type
 */
export function formatCustomValue(value: number | string, format: FormatType): string {
    if (value === null || value === undefined || value === '') return '-';

    switch (format) {
        case 'currency':
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(Number(value) || 0);

        case 'number':
            return new Intl.NumberFormat('pt-BR').format(Number(value) || 0);

        case 'percentage':
            return `${(Number(value) || 0).toFixed(2)}%`;

        case 'text':
        default:
            return String(value);
    }
}

/**
 * Get aggregation label for display
 */
export function getAggregationLabel(aggregation: AggregationType): string {
    const labels: Record<AggregationType, string> = {
        sum: 'Soma',
        avg: 'Média',
        max: 'Máximo',
        min: 'Mínimo',
        count: 'Contagem',
        first: 'Primeiro'
    };
    return labels[aggregation] || aggregation;
}

/**
 * Get format label for display
 */
export function getFormatLabel(format: FormatType): string {
    const labels: Record<FormatType, string> = {
        currency: 'Moeda (R$)',
        number: 'Número',
        percentage: 'Porcentagem (%)',
        text: 'Texto'
    };
    return labels[format] || format;
}

/**
 * Get display section label for display
 */
export function getDisplaySectionLabel(section: string): string {
    const labels: Record<string, string> = {
        kpis: 'Métricas Principais',
        secondary: 'Métricas Secundárias',
        funnel: 'Funil',
        temperature: 'Leads por Temperatura',
        sources: 'Origens Específicas',
        table: 'Tabelas'
    };
    return labels[section] || section;
}
