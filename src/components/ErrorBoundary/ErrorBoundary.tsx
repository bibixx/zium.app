import { Component, ReactNode } from "react";
import { Piwik, useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { FullScreenError } from "../FullScreenError/FullScreenError";

interface InnerErrorBoundaryProps {
  children: ReactNode;
  piwik: Piwik;
}
interface InnerErrorBoundaryState {
  error: Error | undefined;
  hasError: boolean;
}

class InnerErrorBoundary extends Component<InnerErrorBoundaryProps, InnerErrorBoundaryState> {
  constructor(props: InnerErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error): void {
    this.props.piwik.trackError(error, "Error Boundary Error");
  }

  render() {
    if (this.state.hasError) {
      return <FullScreenError error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface ErrorBoundaryProps {
  children: ReactNode;
}
export const ErrorBoundary = (props: ErrorBoundaryProps) => {
  const piwik = useAnalytics();

  return <InnerErrorBoundary piwik={piwik} {...props} />;
};
