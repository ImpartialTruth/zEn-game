import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Game Loading Error</h3>
            <p className="error-message">
              This game couldn't load properly. Please try again.
            </p>
            <button 
              className="error-retry-btn"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </button>
            <button 
              className="error-back-btn"
              onClick={this.props.onBack}
            >
              Back to Games
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;