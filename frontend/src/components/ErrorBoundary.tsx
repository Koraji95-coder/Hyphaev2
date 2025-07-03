import { Component, ErrorInfo, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// ⚡ Functional wrapper to inject hook data into class
function withAuthToken(WrappedComponent: typeof Component) {
  return function Wrapper(props: Props) {
    const { token } = useAuth();
    return <WrappedComponent {...props} token={token} />;
  };
}

class ErrorBoundaryCore extends Component<Props & { token: string | null }, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { token } = this.props;

    if (!token) {
      console.warn("No auth token found, skipping log");
      return;
    }

    try {
      const response = await fetch("/logs/save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          agent: "frontend",
          event: "client_crash",
          data: {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            path: window.location.pathname,
          },
        }),
      });

      if (!response.ok) {
        console.error("Crash report failed:", await response.text());
      }
    } catch (e) {
      console.error("Crash logging failed:", e);
    }

    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-fungal-500/10 border border-fungal-500 rounded-lg">
            <h2 className="text-lg font-bold text-fungal-300 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-400">{this.state.error?.message}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withAuthToken(ErrorBoundaryCore);
export default ErrorBoundary;
