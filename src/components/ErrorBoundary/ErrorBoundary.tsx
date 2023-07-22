import { Component, ReactNode } from "react";
import { captureException } from "@sentry/browser";
import { FullScreenError } from "../FullScreenError/FullScreenError";

interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  error: Error | undefined;
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error): void {
    captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return <FullScreenError error={this.state.error} />;
    }

    return this.props.children;
  }
}
