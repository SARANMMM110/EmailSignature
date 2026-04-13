import { Component } from 'react';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-slate-50 px-6 py-16 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
          <p className="max-w-md text-sm text-slate-600">
            An unexpected error occurred. You can go back to the dashboard and try again.
          </p>
          <Link
            to="/dashboard"
            className="rounded-lg bg-[#3b5bdb] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
          >
            Back to dashboard
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
