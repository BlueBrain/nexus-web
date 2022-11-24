import { Component, ErrorInfo, ReactNode } from 'react';
interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}
declare class ErrorBoundary extends Component<Props, State> {
  state: State;
  static getDerivedStateFromError(_: Error): State;
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
  render(): {} | null | undefined;
}
export default ErrorBoundary;
