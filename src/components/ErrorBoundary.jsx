import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-10 text-white bg-slate-900 h-screen overflow-auto">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong.</h1>
            <p className="text-slate-400 mb-4">Please report this error to the developer.</p>
            <div className="bg-black p-4 rounded border border-red-900/50">
                <p className="text-red-400 font-mono text-sm whitespace-pre-wrap">{this.state.error?.toString()}</p>
            </div>
            <div className="mt-4">
                <p className="text-slate-500 text-xs mb-2">Stack Trace:</p>
                <pre className="text-xs text-slate-600 font-mono h-64 overflow-auto p-2 bg-black/50 rounded">
                    {this.state.errorInfo?.componentStack}
                </pre>
            </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
