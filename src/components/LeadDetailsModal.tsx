import { X, User, Briefcase, Target } from 'lucide-react';
import { Lead } from '@/lib/types';
import { Button, buttonVariants } from '@/components/ui/button';

interface LeadDetailsModalProps {
    lead: Lead | null;
    isOpen: boolean;
    onClose: () => void;
}

export function LeadDetailsModal({ lead, isOpen, onClose }: LeadDetailsModalProps) {
    if (!isOpen || !lead) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-card border border-border shadow-2xl animate-fade-in custom-scrollbar">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-start justify-between p-6 bg-white/95 dark:bg-card/95 backdrop-blur border-b border-border">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-foreground">{lead.name}</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide border ${lead.segmentation === 'Super Qualificado' ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-transparent shadow-md shadow-green-500/20' :
                                lead.segmentation === 'Qualificado' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-500/20' :
                                    'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-500 border-red-200 dark:border-red-500/20'
                                }`}>
                                {lead.segmentation}
                            </span>
                            <span className="text-sm font-mono text-muted-foreground">Score: <span className="text-foreground font-bold">{lead.score}</span></span>
                            {lead.email && <span className="text-sm text-muted-foreground border-l border-border pl-3">{lead.email}</span>}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-6 grid gap-8 md:grid-cols-2">

                    {/* Personal Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <User className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-foreground">Dados Pessoais</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <InfoItem label="Idade" value={lead.age} />
                            <InfoItem label="Gênero" value={lead.gender} />
                            <InfoItem label="WhatsApp" value={lead.whatsapp} />
                            <InfoItem label="Educação" value={lead.education} />
                            <InfoItem label="Estado Civil" value={lead.maritalStatus} />
                            <InfoItem label="Filhos" value={lead.hasChildren} />
                            <InfoItem label="Estudante" value={lead.isStudent} />
                        </div>
                    </div>

                    {/* Business Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <Briefcase className="h-5 w-5 text-secondary" />
                            <h3 className="font-semibold text-foreground">Dados do Negócio</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <InfoItem label="Tem Loja?" value={lead.hasStore} highlight />
                            <InfoItem label="Tipo de Loja" value={lead.storeType} />
                            <InfoItem label="Tempo de Loja" value={lead.storeTime} />
                            <InfoItem label="Faturamento" value={lead.revenue} highlight />
                            <InfoItem label="Equipe" value={lead.teamStructure} />
                            <InfoItem label="Gestão" value={lead.management} />
                        </div>
                    </div>

                    {/* Strategy & Challenges - Full Width */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <Target className="h-5 w-5 text-purple-dark dark:text-purple" />
                            <h3 className="font-semibold text-foreground">Estratégia e Desafios</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                            <InfoItem label="Presença Digital" value={lead.digitalPresence} full highlight />
                            <InfoItem label="Vendas" value={lead.sales} full highlight />
                            <InfoItem label="Maior Dificuldade" value={lead.difficulty} full />
                            <InfoItem label="Dificuldade do Desafio" value={lead.challengeDifficulty} full />

                            <div className="md:col-span-2 p-4 rounded-xl bg-muted/30 border border-border">
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Maior Sonho</label>
                                <p className="text-foreground italic">"{lead.dream}"</p>
                            </div>

                            <div className="md:col-span-2 p-4 rounded-xl bg-purple-light/10 dark:bg-purple/10 border border-purple-light/20 dark:border-purple/20 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-dark/10 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-purple-dark dark:text-purple mb-1">Dúvida Principal</label>
                                <p className="text-foreground font-medium italic">"{lead.question}"</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-muted/10 border-t border-border flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="bg-background border-input hover:bg-muted text-foreground">
                        Fechar
                    </Button>
                    {lead.whatsapp && (
                        <a
                            href={`https://api.whatsapp.com/send/?phone=55${String(lead.whatsapp).replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonVariants({ className: "bg-primary text-primary-foreground hover:bg-primary/90" })}
                        >
                            Iniciar Contato
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

interface InfoItemProps {
    label: string;
    value?: string | number;
    full?: boolean;
    highlight?: boolean;
}

function InfoItem({ label, value, full = false, highlight = false }: InfoItemProps) {
    return (
        <div className={`
            ${full ? 'col-span-2 sm:col-span-1' : ''} 
            ${highlight ? 'p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 shadow-sm' : ''}
            transition-all duration-200 hover:scale-[1.01]
        `}>
            <label className={`block text-xs font-medium uppercase tracking-wide
                ${highlight ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-muted-foreground'}
            `}>{label}</label>
            <p className={`mt-1 font-medium break-words
                ${highlight ? 'text-foreground dark:text-emerald-50 text-sm leading-relaxed' : 'text-foreground'}
            `}>{value || '-'}</p>
        </div>
    );
}
