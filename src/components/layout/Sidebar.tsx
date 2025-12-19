import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileSpreadsheet, Filter, Download, Settings, Target, BarChart3, HelpCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: BarChart3, label: 'Tráfego Pago', path: '/traffic' },
    { icon: Target, label: 'Metas de Lançamento', path: '/launches' }, // Changed path to '/launches' for cleaner URL
    { icon: FileSpreadsheet, label: 'Análise', path: '/analysis' }, // New
    { icon: Filter, label: 'Filtros', path: '/filters' },
    { icon: Download, label: 'Exportar', path: '/export' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
];

export function Sidebar() {
    const location = useLocation();
    const { signOut, user } = useAuth();

    // Get user initials or default
    const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'GS';

    return (

        <div className="flex h-screen w-[280px] flex-col bg-card border-r border-border text-card-foreground transition-all duration-300">
            {/* Logo Area */}
            <div className="flex h-[80px] items-center px-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display font-bold text-xl tracking-tight leading-none text-foreground">GITA</span>
                        <span className="text-sm font-medium text-muted-foreground tracking-widest leading-none">SCORE</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-purple/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 space-y-2 border-t border-border bg-muted/20">
                <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <HelpCircle className="h-5 w-5" />
                    Ajuda e Suporte
                </button>

                <div className="flex items-center gap-3 rounded-xl p-3 bg-muted/50 border border-border mt-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-dark to-purple-light dark:from-purple dark:to-purple-dark flex items-center justify-center text-white font-bold text-sm shadow-inner">
                        {userInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                        <p className="text-xs text-muted-foreground">Admin</p>
                    </div>
                    <button onClick={() => signOut()} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );

}
