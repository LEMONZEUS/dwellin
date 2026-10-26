import { Component } from "react";

// If any screen throws while rendering, show the error here instead of a blank page.
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Dwellin crashed:", error, info?.componentStack);
  }

  reset = () => {
    try {
      localStorage.removeItem("dwellin-state-v1");
    } catch {
      /* ignore */
    }
    window.location.hash = "#/login";
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="crash" role="alert">
        <h1>Something went wrong</h1>
        <p>This screen failed to load. Copy the message below if you need to report it.</p>
        <pre>{String(this.state.error?.message || this.state.error)}</pre>
        <div className="btn-row">
          <button type="button" className="pill" onClick={() => window.location.reload()}>Reload</button>
          <button type="button" className="pill ghost" onClick={this.reset}>Reset demo data</button>
        </div>
      </div>
    );
  }
}
