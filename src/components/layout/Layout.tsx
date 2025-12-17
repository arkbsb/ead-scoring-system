import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function Layout() {
    return (
        <div className="flex h-screen w-full bg-dark-base overflow-hidden font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto bg-dark-base relative scroll-smooth">
                    {/* Background Grid Effect */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none fixed"></div>

                    <div className="container max-w-[1600px] mx-auto p-6 lg:p-10 relative z-10 animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
