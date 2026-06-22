"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  label?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error(`[ErrorBoundary:${this.props.label ?? "unknown"}]`, error);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-800/40 bg-red-900/10 p-6 text-center">
        <span className="text-2xl">⚠️</span>
        <p className="text-sm text-red-300">
          {this.props.label
            ? `${this.props.label} failed to load`
            : "Something went wrong"}
        </p>
        <button
          onClick={this.retry}
          className="rounded-lg border border-red-700/50 bg-red-900/30 px-4 py-1.5 text-xs text-red-300 transition hover:bg-red-900/50"
        >
          Try again
        </button>
      </div>
    );
  }
}
