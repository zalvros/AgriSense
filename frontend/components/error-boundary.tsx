"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="rounded-2xl border border-red-600/30 bg-red-600/10 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-1 text-red-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-200">Something went wrong</h3>
                <p className="mt-1 text-sm text-red-300/80">{this.state.error?.message || "An unexpected error occurred"}</p>
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="mt-3 rounded-md bg-red-600/20 px-3 py-1 text-sm text-red-200 hover:bg-red-600/30"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
