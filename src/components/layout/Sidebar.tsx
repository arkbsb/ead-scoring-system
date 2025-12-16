import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: BarChart3, label: 'Análises', path: '/analysis' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <div className="flex h-screen w-64 flex-col bg-slate-900 text-white">
            <div className="flex h-16 items-center justify-center border-b border-slate-800">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    LeadScoring
                </h1>
            </div>

            <nav className="flex-1 space-y-1 p-4">
                {sidebarItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-slate-800 p-4">
                <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
                    <LogOut className="h-5 w-5" />
                    Sair
                </button>
            </div>
        </div>
    );
}
