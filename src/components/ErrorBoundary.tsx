/**
 * Error Boundary для обработки ошибок рендеринга
 */

'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px', textAlign: 'center' }}>
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>Ошибка</h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Произошла ошибка при загрузке приложения.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Перезагрузить страницу
            </button>
            {this.state.error && (
              <details style={{ marginTop: '24px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#6b7280' }}>Детали ошибки</summary>
                <pre style={{ marginTop: '12px', padding: '12px', background: '#f3f4f6', borderRadius: '8px', overflow: 'auto' }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
