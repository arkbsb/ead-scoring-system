import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

export function Login() {
    const { signInWithGoogle, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Carregando...</div>;
    }

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Lead Scoring System</CardTitle>
                    <CardDescription>Faça login para acessar seus lançamentos</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-8">
                    <Button onClick={signInWithGoogle} size="lg" className="w-full">
                        <LogIn className="mr-2 h-4 w-4" />
                        Entrar com Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
