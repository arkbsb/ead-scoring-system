import { useState } from 'react';
import { useLeads } from '@/context/LeadsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoogleSheetConfig } from '@/lib/google-sheets';
import { AlertCircle, CheckCircle2, Plus, Trash2, Edit2, Play, ArrowRight } from 'lucide-react';
import { DataMapper } from '@/components/settings/DataMapper';

export function Settings() {
    const { launches, activeLaunchId, addLaunch, updateLaunch, removeLaunch, selectLaunch, error } = useLeads();

    const [isEditing, setIsEditing] = useState(false);
    const [isMapping, setIsMapping] = useState(false);
    const [formData, setFormData] = useState<GoogleSheetConfig>({
        id: '',
        name: '',
        spreadsheetId: '',
        sheetName: '',
        accessToken: ''
    });

    const handleEdit = (launch: GoogleSheetConfig) => {
        setFormData(launch);
        setIsEditing(true);
    };

    const handleNew = () => {
        setFormData({
            id: crypto.randomUUID(),
            name: '',
            spreadsheetId: '',
            sheetName: '',
            accessToken: ''
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            id: '',
            name: '',
            spreadsheetId: '',
            sheetName: '',
            accessToken: ''
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const existing = launches.find(l => l.id === formData.id);
        if (existing) {
            updateLaunch(formData);
        } else {
            addLaunch(formData);
        }
        setIsEditing(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
                    <p className="text-muted-foreground">Gerencie seus lançamentos e conexões</p>
                </div>
                {!isEditing && (
                    <Button onClick={handleNew}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Lançamento
                    </Button>
                )}
            </div>

            {isEditing ? (
                <Card>
                    <CardHeader>
                        <CardTitle>{launches.find(l => l.id === formData.id) ? 'Editar Lançamento' : 'Novo Lançamento'}</CardTitle>
                        <CardDescription>
                            Configure os dados da planilha do Google Sheets.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome do Lançamento</label>
                                <Input
                                    placeholder="Ex: Lançamento Janeiro 2025"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Spreadsheet ID</label>
                                <Input
                                    placeholder="ID da planilha"
                                    value={formData.spreadsheetId}
                                    onChange={(e) => setFormData({ ...formData, spreadsheetId: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Encontrado na URL: docs.google.com/spreadsheets/d/<strong>ID_AQUI</strong>/edit
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome da Aba</label>
                                <Input
                                    placeholder="Ex: Respostas ao formulário 1"
                                    value={formData.sheetName}
                                    onChange={(e) => setFormData({ ...formData, sheetName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Access Token (Opcional)</label>
                                <Input
                                    type="password"
                                    placeholder="OAuth Access Token"
                                    value={formData.accessToken || ''}
                                    onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="button" onClick={() => setIsMapping(true)}>
                                    Próximo: Mapear Colunas
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : isMapping ? (
                <DataMapper
                    config={formData}
                    onSave={(newConfig) => {
                        const existing = launches.find(l => l.id === newConfig.id);
                        if (existing) {
                            updateLaunch(newConfig);
                        } else {
                            addLaunch(newConfig);
                        }
                        setIsMapping(false);
                        setIsEditing(false);
                    }}
                    onCancel={() => setIsMapping(false)}
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {launches.map((launch) => (
                        <Card key={launch.id} className={activeLaunchId === launch.id ? 'border-primary ring-1 ring-primary' : ''}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-semibold">{launch.name}</CardTitle>
                                    <CardDescription className="text-xs truncate w-[200px]">
                                        {launch.spreadsheetId}
                                    </CardDescription>
                                </div>
                                {activeLaunchId === launch.id && (
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 pt-4">
                                    <Button
                                        variant={activeLaunchId === launch.id ? "secondary" : "default"}
                                        size="sm"
                                        className="w-full"
                                        onClick={() => selectLaunch(launch.id)}
                                        disabled={activeLaunchId === launch.id}
                                    >
                                        <Play className="mr-2 h-3 w-3" />
                                        {activeLaunchId === launch.id ? 'Ativo' : 'Ativar'}
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => handleEdit(launch)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeLaunch(launch.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {launches.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Plus className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">Nenhum lançamento configurado</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                Comece adicionando seu primeiro lançamento para visualizar os dados.
                            </p>
                            <Button onClick={handleNew}>
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Lançamento
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}
        </div>
    );
}
