"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PlayerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center"
          role="alert"
        >
          <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden />
          <div>
            <p className="text-sm font-medium text-destructive">Terjadi kesalahan pada pemutar</p>
            <p className="mt-1 text-xs text-muted">
              {this.state.error?.message ?? "Gagal memuat pemutar audio"}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs hover:bg-border/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <RefreshCw className="h-3 w-3" aria-hidden />
            Coba lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
