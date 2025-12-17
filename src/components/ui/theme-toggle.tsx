import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110
                 text-text-muted hover:bg-light-elevated dark:hover:bg-dark-elevated"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-warning-dark" />
            ) : (
                <Moon className="w-5 h-5 text-primary-light-default" />
            )}
        </button>
    );
};
