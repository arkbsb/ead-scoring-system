import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    ShoppingCart,
    Target,
    Zap,
    Heart,
    Star,
    Award,
    BarChart3,
    PieChart,
    Activity,
    Percent,
    Calculator,
    Coins,
    CreditCard,
    Wallet,
    type LucideIcon
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    ShoppingCart,
    Target,
    Zap,
    Heart,
    Star,
    Award,
    BarChart3,
    PieChart,
    Activity,
    Percent,
    Calculator,
    Coins,
    CreditCard,
    Wallet,
};

export const ICON_OPTIONS = [
    { value: 'DollarSign', label: 'Cifrão' },
    { value: 'TrendingUp', label: 'Tendência Alta' },
    { value: 'TrendingDown', label: 'Tendência Baixa' },
    { value: 'Users', label: 'Usuários' },
    { value: 'ShoppingCart', label: 'Carrinho' },
    { value: 'Target', label: 'Alvo' },
    { value: 'Zap', label: 'Raio' },
    { value: 'Heart', label: 'Coração' },
    { value: 'Star', label: 'Estrela' },
    { value: 'Award', label: 'Prêmio' },
    { value: 'BarChart3', label: 'Gráfico de Barras' },
    { value: 'PieChart', label: 'Gráfico de Pizza' },
    { value: 'Activity', label: 'Atividade' },
    { value: 'Percent', label: 'Porcentagem' },
    { value: 'Calculator', label: 'Calculadora' },
    { value: 'Coins', label: 'Moedas' },
    { value: 'CreditCard', label: 'Cartão' },
    { value: 'Wallet', label: 'Carteira' },
];

export interface ColorPreset {
    name: string;
    value: string;
    bg: string;
    text: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
    { name: 'Roxo', value: 'purple', bg: 'bg-purple-400/10', text: 'text-purple-400' },
    { name: 'Azul', value: 'blue', bg: 'bg-blue-400/10', text: 'text-blue-400' },
    { name: 'Verde', value: 'green', bg: 'bg-green-400/10', text: 'text-green-400' },
    { name: 'Amarelo', value: 'yellow', bg: 'bg-yellow-400/10', text: 'text-yellow-400' },
    { name: 'Vermelho', value: 'red', bg: 'bg-red-400/10', text: 'text-red-400' },
    { name: 'Rosa', value: 'pink', bg: 'bg-pink-400/10', text: 'text-pink-400' },
    { name: 'Ciano', value: 'cyan', bg: 'bg-cyan-400/10', text: 'text-cyan-400' },
    { name: 'Laranja', value: 'orange', bg: 'bg-orange-400/10', text: 'text-orange-400' },
    { name: 'Esmeralda', value: 'emerald', bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
    { name: 'Índigo', value: 'indigo', bg: 'bg-indigo-400/10', text: 'text-indigo-400' },
];

export function getIcon(iconName?: string): LucideIcon {
    if (!iconName || !ICON_MAP[iconName]) {
        return BarChart3; // Default icon
    }
    return ICON_MAP[iconName];
}

export function getColorClasses(colorValue?: string): { bg: string; text: string } {
    const preset = COLOR_PRESETS.find(c => c.value === colorValue);
    if (!preset) {
        return { bg: 'bg-purple-400/10', text: 'text-purple-400' }; // Default
    }
    return { bg: preset.bg, text: preset.text };
}
