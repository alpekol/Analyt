import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-700 bg-red-100 rounded text-lg">
          <b>Сбой приложения:</b> {String(this.state.error)}
        </div>
      );
    }
    return this.props.children;
  }
}
