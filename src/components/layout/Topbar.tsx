import { Bell, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Topbar() {
    const { user } = useAuth();
    const location = useLocation();
    const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'GS';

    // Simple breadcrumb logic
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = ['Home', ...pathSegments];

    return (
        <div className="h-20 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30 transition-all duration-300">
            {/* Left: Breadcrumbs & Title */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/30" />}
                            <span className={`capitalize ${index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'hover:text-foreground transition-colors cursor-pointer'}`}>
                                {crumb === 'Home' && index === 0 && location.pathname === '/' ? 'Dashboard' : crumb}
                            </span>
                        </div>
                    ))}
                </div>
                <h2 className="text-xl font-display font-semibold text-foreground capitalize">
                    {pathSegments.length === 0 ? 'Dashboard' : pathSegments[pathSegments.length - 1]}
                </h2>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar leads..."
                        className="h-10 w-64 rounded-xl bg-muted/50 border border-input pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                </div>

                <ThemeToggle />

                {/* Notifications */}
                <button className="relative p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-background"></span>
                </button>

                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-dark to-purple-light dark:from-purple dark:to-purple-dark border border-white/10 flex items-center justify-center text-white font-bold text-sm shadow-inner cursor-pointer hover:scale-105 transition-transform">
                    {userInitials}
                </div>
            </div>
        </div>
    );
}
