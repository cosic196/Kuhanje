import React from 'react';

interface State { error: Error | null }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#dc2626' }}>Greška pri pokretanju aplikacije</h1>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Detalji greške (otvorite F12 Console za više informacija):
          </p>
          <pre style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
            {this.state.error.message}
            {'\n'}
            {this.state.error.stack}
          </pre>
          <button
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#d97706', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            onClick={() => { localStorage.clear(); window.location.reload(); }}
          >
            Obriši podatke i pokušaj ponovo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
