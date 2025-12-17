/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'Roboto Mono', 'monospace'],
                body: ['Inter', 'sans-serif'],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",

                // Brand Colors
                purple: {
                    DEFAULT: '#6B46C1',
                    dark: '#553C9A',
                    light: '#9F7AEA',
                    glow: 'rgba(107, 70, 193, 0.3)',
                },
                mint: {
                    DEFAULT: '#10B981',
                    dark: '#059669',
                    light: '#34D399',
                },

                // Theme Specific Colors
                dark: {
                    base: '#0F0F1E',
                    surface: '#1A1A2E',
                    card: '#1A1A2E',
                    elevated: '#252541',
                    elem: '#252541', // Alias for elevated
                    hover: '#2D2D4A',
                    border: 'rgba(255, 255, 255, 0.1)',
                },
                light: {
                    base: '#F8F9FC',
                    surface: '#FFFFFF',
                    elevated: '#F1F3F9',
                    hover: '#E5E7EB',
                    border: 'rgba(0, 0, 0, 0.08)',
                },

                // Semantics
                primary: {
                    DEFAULT: '#6B46C1',
                    dark: '#553C9A',
                    light: '#9F7AEA',
                    hover: '#7C3AED',
                    foreground: "hsl(var(--primary-foreground))",
                },
                'primary-light': {
                    DEFAULT: '#7C3AED',
                    dark: '#6B21A8',
                    light: '#A78BFA',
                },
                secondary: {
                    DEFAULT: '#10B981',
                    dark: '#059669',
                    light: '#34D399',
                    foreground: "hsl(var(--secondary-foreground))",
                },

                // Text
                text: {
                    primary: {
                        dark: '#FFFFFF',
                        light: '#1A1A2E',
                    },
                    muted: '#718096',
                    secondary: {
                        dark: '#A0AEC0',
                        light: '#4A5568',
                    },
                },

                // Shadcn / System
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            backgroundImage: {
                'gradient-hero-dark': 'linear-gradient(135deg, #6B46C1 0%, #9F7AEA 50%, #10B981 100%)',
                'gradient-hero-light': 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 50%, #059669 100%)',
                'gradient-card-dark': 'linear-gradient(180deg, rgba(107, 70, 193, 0.1) 0%, transparent 100%)',
                'gradient-card-light': 'linear-gradient(180deg, rgba(124, 58, 237, 0.05) 0%, transparent 100%)',
            },
            boxShadow: {
                'glow-primary-dark': '0 0 20px rgba(107, 70, 193, 0.3)',
                'glow-primary-light': '0 0 20px rgba(124, 58, 237, 0.2)',
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "blob": "blob 7s infinite",
                "float": "float 3s ease-in-out infinite",
                "fade-in": "fadeIn 0.5s ease-out forwards",
                "slide-in-right": "slideInRight 0.5s ease-out forwards",
                "shimmer": "shimmer 1.5s infinite",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                blob: {
                    "0%": { transform: "translate(0px, 0px) scale(1)" },
                    "33%": { transform: "translate(30px, -50px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
                    "100%": { transform: "translate(0px, 0px) scale(1)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideInRight: {
                    "0%": { opacity: "0", transform: "translateX(20px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                shimmer: {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                },
            },
        },
    },
    plugins: [],
}
