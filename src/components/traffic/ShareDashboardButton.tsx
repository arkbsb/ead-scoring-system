import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Copy, Check, Trash2, RefreshCw } from 'lucide-react';
import { createPublicShare, getUserActiveShare, revokePublicShare, getPublicShareUrl } from '@/lib/public-share';
import type { PublicShare } from '@/lib/public-share';
import { useLaunch } from '@/context/LaunchContext';
import { useTraffic } from '@/context/TrafficContext';

interface ShareDashboardButtonProps {
    spreadsheetId: string | null;
}

export function ShareDashboardButton({ spreadsheetId }: ShareDashboardButtonProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [activeShare, setActiveShare] = useState<PublicShare | null>(null);
    const { trafficMapping } = useTraffic();
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (open && user) {
            loadActiveShare();
        }
    }, [open, user]);

    const loadActiveShare = async () => {
        if (!user) return;

        setLoading(true);
        const { data } = await getUserActiveShare(user.id);
        setActiveShare(data);
        setLoading(false);
    };

    const { launches } = useLaunch();
    const activeLaunch = launches.find(l => l.status === 'Ativo');

    const handleCreateShare = async () => {
        if (!user) return;

        setLoading(true);
        const { data, error } = await createPublicShare(
            user.id,
            spreadsheetId,
            activeLaunch?.id || null,
            'traffic',
            trafficMapping
        );

        if (error) {
            console.error('Share creation error:', error);
            const err = error as any;
            alert(`Erro ao criar link: ${err.message || 'Erro desconhecido'} (${err.details || ''})`);
        } else {
            setActiveShare(data);
        }
        setLoading(false);
    };

    const handleUpdateShare = async () => {
        if (!activeShare) return;

        setLoading(true);
        // We can reuse createPublicShare logic but we might want a specific update function
        // For now, revoking and recreating generates a new token which invalidates the old link. 
        // We should add an UPDATE function to public-share.ts, but for quick fix, 
        // let's just revoke/recreate OR better: update traffic_mapping column directly via supabase client here
        // actually, createPublicShare is for NEW shares. Let's use supabase client directly here for simplicity

        try {
            // Import supabase dynamically or from context? We don't have supabase client in scope...
            // Wait, we can use the import from public-share if we export it, or just add updatePublicShare to lib
            // Let's modify public-share.ts to export an update function first.
            // actually, I can just use the createPublicShare logic but I'll update public-share.ts properly first.
            // Wait, I cannot edit public-share.ts in the same step.
            // I'll assume I will add updatePublicShare in the next step or use a workaround.
            // Workaround: I'll use the createPublicShare logic but that creates a NEW token. Not good for existing links.

            // Let's assume I'll add `updatePublicShare` to '@/lib/public-share' in next step.
            const { updatePublicShare } = await import('@/lib/public-share');

            const { error } = await updatePublicShare(
                activeShare.id,
                {
                    traffic_mapping: trafficMapping,
                    launch_id: activeLaunch?.id || null,
                    spreadsheet_id: spreadsheetId
                }
            );

            if (error) throw error;

            alert('Link atualizado com as novas configurações!');
            loadActiveShare(); // reload to get fresh data
        } catch (err) {
            console.error('Update share error:', err);
            alert('Erro ao atualizar link');
        }

        setLoading(false);
    };

    const handleCopyLink = async () => {
        if (!activeShare) return;

        const url = getPublicShareUrl(activeShare.token);
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRevoke = async () => {
        if (!activeShare) return;

        if (!confirm('Tem certeza que deseja revogar este link? Ele não funcionará mais.')) {
            return;
        }

        setLoading(true);
        const { error } = await revokePublicShare(activeShare.id);

        if (error) {
            alert('Erro ao revogar link');
            console.error(error);
        } else {
            setActiveShare(null);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary"
                >
                    <Share2 className="h-4 w-4" />
                    Compartilhar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-primary" />
                        Compartilhar Dashboard
                    </DialogTitle>
                    <DialogDescription>
                        Gere um link público para que qualquer pessoa possa visualizar esta dashboard.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : activeShare ? (
                        <>
                            {/* Active Share Display */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                                    <div className="flex-1 min-w-0 mr-3">
                                        <p className="text-xs text-muted-foreground mb-1">Link Público</p>
                                        <p className="text-sm font-mono truncate">
                                            {getPublicShareUrl(activeShare.token)}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleCopyLink}
                                        className="flex-shrink-0"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="p-3 rounded-lg bg-muted/30">
                                        <p className="text-xs text-muted-foreground mb-1">Visualizações</p>
                                        <p className="font-semibold">{activeShare.view_count || 0}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/30">
                                        <p className="text-xs text-muted-foreground mb-1">Criado em</p>
                                        <p className="font-semibold">
                                            {new Date(activeShare.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleRevoke}
                                    className="w-full"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Revogar Link
                                </Button>

                                <div className="pt-2 border-t mt-4">
                                    <p className="text-xs text-muted-foreground mb-2 text-center">
                                        Fez alteração nas colunas ou no lançamento ativo?
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleUpdateShare}
                                        className="w-full text-xs h-8 border-dashed"
                                    >
                                        <RefreshCw className="h-3 w-3 mr-2" />
                                        Atualizar Configurações do Link
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Create Share */}
                            <div className="text-center py-6 space-y-4">
                                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Share2 className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Você ainda não tem um link de compartilhamento ativo.
                                    </p>
                                    <Button onClick={handleCreateShare} className="w-full">
                                        Gerar Link de Compartilhamento
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <p className="font-semibold mb-1">⚠️ Atenção:</p>
                    <p>Qualquer pessoa com este link poderá visualizar os dados da dashboard. Compartilhe apenas com pessoas confiáveis.</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
