import { useState } from 'react';
import { useTraffic } from '@/context/TrafficContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, CheckCircle, Database, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TrafficSheetConfig() {
    const { spreadsheetId, setSpreadsheetId } = useTraffic();
    const [inputVal, setInputVal] = useState(spreadsheetId);
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = () => {
        setSpreadsheetId(inputVal);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors border",
                    spreadsheetId
                        ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                        : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50 hover:text-white"
                )}
            >
                {spreadsheetId ? <CheckCircle className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                {spreadsheetId ? "Conectado" : "Configurar Planilha"}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-12 w-[350px] p-6 rounded-xl border border-white/10 bg-[#1A1A1A] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <Database className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-white">Conexão Google Sheets</h3>
                                    <p className="text-xs text-muted-foreground">Vincule seus dados</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-white">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="sheetId">ID da Planilha (Spreadsheet ID)</Label>
                                <Input
                                    id="sheetId"
                                    value={inputVal}
                                    onChange={(e) => setInputVal(e.target.value)}
                                    placeholder="ex: 1BxiMVs..."
                                    className="bg-black/20 border-white/10"
                                />
                                <div className="text-[10px] text-muted-foreground space-y-1">
                                    <p>Abas necessárias:</p>
                                    <ul className="list-disc pl-4 text-white/70">
                                        <li>Campanhas</li>
                                        <li>Conjunto de Ads</li>
                                        <li>Anúncios</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancelar</Button>
                                <Button size="sm" onClick={handleSave}>Salvar Conexão</Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
