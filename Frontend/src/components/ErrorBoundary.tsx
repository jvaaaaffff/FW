import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(_: Error, __: ErrorInfo) {
    // Intentionally quiet error boundary logging for a cleaner console.
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      try {
        if (this.state.error?.message) {
          const parsedError = JSON.parse(this.state.error.message);
          if (parsedError.error) {
            errorMessage = parsedError.error;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full text-center">
            <h2 className="text-2xl font-serif font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-brand-muted mb-6">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-brand-accent text-white px-6 py-2 rounded-sm hover:bg-brand-accent/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
