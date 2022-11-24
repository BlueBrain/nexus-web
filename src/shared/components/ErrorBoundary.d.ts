import * as React from 'react';
interface Error {
  stack?: string;
}
interface ErrorBoundaryProps {
  fallback?: React.FunctionComponent<{
    resetErrorState?: () => void;
  }>;
}
declare class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  {
    hasError: boolean;
  }
> {
  constructor(props: ErrorBoundaryProps);
  static getDerivedStateFromError(
    error: Error
  ): {
    hasError: boolean;
  };
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
  render(): {} | null | undefined;
}
export default ErrorBoundary;
