import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // If too many errors, don't try to recover automatically
    if (this.state.errorCount > 3) {
      console.error("Too many errors, stopping automatic recovery");
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-2xl w-full p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Oops! Something went wrong
                </h1>
                <p className="text-muted-foreground">
                  Don't worry, we've logged this error
                </p>
              </div>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 p-4 bg-muted rounded-lg overflow-auto">
                <p className="font-mono text-sm text-destructive mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-xs text-muted-foreground overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={this.handleReset} variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleReload} variant="outline">
                Reload Page
              </Button>
            </div>

            {this.state.errorCount > 2 && (
              <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Multiple errors detected. If this persists, try clearing your browser cache or contact support.
                </p>
              </div>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
