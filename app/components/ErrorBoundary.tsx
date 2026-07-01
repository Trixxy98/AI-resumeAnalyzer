import React from 'react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {hasError: false, error: null};
    }

    static getDerivedStateFromError(error: Error): State {
        return {hasError: true, error};
    }

    componentDidCatch(error: Error, info:React.ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className='min-h-screen bg-slate-50 flex items-center justify-center p-6'>
                    <div className='max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4'>
                        <div className='text-5xl'>⚠️</div>
                        <h1 className='text-xl font-bold text-slate-900'>Something went wrong</h1>
                        <p className='text-slate-500 text-sm'>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                        onClick={() => window.location.reload()}
                        className='mt-4 px-6 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-700'>
                            Reload Page
                        </button>
                        </div>
                </div>
            )
        }

        return this.props.children;
    }
}

export default ErrorBoundary;