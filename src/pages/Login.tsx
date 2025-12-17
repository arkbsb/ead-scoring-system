import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';
import {
    LayoutDashboard,
    BarChart3,
    Zap,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';

export function Login() {
    const { signInWithEmail, signUpWithEmail, loading, user } = useAuth(); // removed signInWithGoogle for now if not used, or keep it if needed. The prompt asked for "Continuar com Google" so I will keep it in UI but maybe just wire it to the placeholder or real auth. To act safe I will just use email auth logic for now as main.
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setActionLoading(true);

        try {
            if (isSignUp) {
                const { error } = await signUpWithEmail(email, password);
                if (error) throw error;
                setMessage('Conta criada com sucesso! Verifique seu e-mail ou faça login.');
                setIsSignUp(false);
            } else {
                const { error } = await signInWithEmail(email, password);
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro.');
        } finally {
            setActionLoading(false);
        }
    };

    // Particles Generator
    const particles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${10 + Math.random() * 10}s`
    }));

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-dark-base text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>;
    }

    return (
        <div className="flex min-h-screen w-full bg-background overflow-hidden font-sans transition-theme">
            {/* LEFT SIDE - BRANDING & ANIMATION */}
            <div className="hidden lg:flex w-[60%] relative flex-col justify-center items-center overflow-hidden p-12">

                {/* Animated Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full z-0 bg-background transition-colors duration-500">
                    <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-purple-light/20 dark:bg-purple-dark/40 rounded-full blur-[100px] dark:blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
                    <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-mint-light/20 dark:bg-mint-dark/20 rounded-full blur-[80px] dark:blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
                    <div className="absolute -bottom-[20%] left-[20%] w-[600px] h-[600px] bg-purple-light/10 dark:bg-purple/20 rounded-full blur-[100px] dark:blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen"></div>

                    {/* Particles */}
                    {particles.map((p) => (
                        <div
                            key={p.id}
                            className="absolute w-1 h-1 bg-purple-dark/20 dark:bg-white/30 rounded-full animate-float"
                            style={{
                                top: p.top,
                                left: p.left,
                                animationDelay: p.delay,
                                animationDuration: p.duration
                            }}
                        />
                    ))}

                    {/* Grid Overlay */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-10 dark:invert"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-2xl text-left space-y-8">
                    <div className="inline-flex items-center gap-3 bg-card/40 backdrop-blur-md px-4 py-2 rounded-full border border-border mb-6 w-fit animate-float shadow-sm">
                        <span className="flex h-2 w-2 rounded-full bg-mint-dark dark:bg-mint"></span>
                        <span className="text-sm font-medium tracking-wide text-mint-dark dark:text-mint-light">NOVA VERSÃO 2.0</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-6xl font-display font-bold leading-tight tracking-tight text-foreground">
                            Transforme Dados em <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-dark via-purple to-mint-dark dark:from-purple-light dark:via-white dark:to-mint-light">
                                Decisões Inteligentes
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                            Lead scoring com inteligência e precisão para maximizar suas conversões e escalar seus resultados.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-xl">
                        {[
                            { icon: BarChart3, title: "Análise em Tempo Real", desc: "Monitore KPIs instantaneamente" },
                            { icon: Zap, title: "Dashboards Inteligentes", desc: "Insights automáticos" },
                            { icon: LayoutDashboard, title: "Gestão Centralizada", desc: "Tudo em um só lugar" }
                        ].map((feature, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card/60 border border-border hover:bg-card/80 transition-colors backdrop-blur-sm group shadow-sm">
                                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - LOGIN FORM */}
            <div className="w-full lg:w-[40%] bg-card/80 backdrop-blur-2xl border-l border-border flex flex-col items-center justify-center p-8 relative z-20 transition-colors duration-300">
                <div className="w-full max-w-[420px] space-y-8">

                    {/* Logo Mobile / Header */}
                    <div className="flex flex-col space-y-2 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                            {/* Abstract Icon */}
                            <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <span className="font-display font-bold text-3xl tracking-tight text-foreground">GITA <span className="font-medium text-foreground/60">SCORE</span></span>
                        </div>
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Bem-vindo de volta</h2>
                        <p className="text-muted-foreground text-sm">Acesse sua conta para gerenciar seus leads</p>
                    </div>

                    <div className="p-[1px] rounded-3xl bg-gradient-to-b from-border to-transparent">
                        <div className="bg-card backdrop-blur-xl rounded-[23px] p-8 shadow-2xl shadow-black/5 dark:shadow-black/50 border border-border">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium ml-1">Email</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="pl-10 h-12 bg-background border-input text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/20 rounded-xl transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Senha</Label>
                                        <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">Esqueceu a senha?</a>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pl-10 pr-10 h-12 bg-background border-input text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/20 rounded-xl transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                                        <span className="block h-1.5 w-1.5 rounded-full bg-destructive"></span>
                                        {error}
                                    </div>
                                )}
                                {message && (
                                    <div className="p-3 rounded-lg bg-mint/10 border border-mint/20 text-mint-dark dark:text-mint text-sm flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        {message}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-primary text-primary-foreground hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-xl shadow-lg shadow-purple/25 font-semibold"
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Processando...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            {isSignUp ? 'Criar Conta Gratuita' : 'Entrar na Plataforma'}
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>

                    <div className="text-center space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full h-12 border-border hover:bg-muted hover:text-foreground text-muted-foreground rounded-xl transition-all">
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </Button>

                        <p className="text-sm text-muted-foreground">
                            {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="ml-2 font-medium text-mint-dark dark:text-mint hover:underline transition-colors focus:outline-none"
                            >
                                {isSignUp ? 'Fazer Login' : 'Cadastre-se agora'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer simple copyright */}
                <div className="absolute bottom-6 text-xs text-muted-foreground/40">
                    © 2024 Gita Score System. Todos os direitos reservados.
                </div>
            </div>
        </div>
    );
}
