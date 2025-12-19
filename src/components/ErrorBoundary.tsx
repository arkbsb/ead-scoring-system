import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
    children: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <h3 className="font-bold flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Erro no componente {this.props.name || 'UI'}
                    </h3>
                    <p className="mt-1 font-mono text-xs opacity-90">
                        {this.state.error?.message || "Erro desconhecido"}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
