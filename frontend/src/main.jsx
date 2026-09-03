import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";

import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AgentDashboard from "./pages/agent/AgentDashboard";
import PropertiesPage from "./pages/property/PropertiesPage";
import PropertyDetailPage from "./pages/property/PropertyDetailPage";
import PropertyFormPage from "./pages/property/PropertyFormPage";
import BuyerRequestsPage from "./pages/request/BuyerRequestsPage";
import BuyerRequestFormPage from "./pages/request/BuyerRequestFormPage";
import MatchingPage from "./pages/matching/MatchingPage";

function NotFound() {
  return (
    <div className="empty">
      <div className="empty-title">صفحه پیدا نشد</div>
      <p>نشانی وارد شده معتبر نیست یا صفحه جابه‌جا شده است.</p>
      <Link to="/" className="btn btn-primary">بازگشت به خانه</Link>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(p) {
    super(p);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  // Clear the error when the user navigates elsewhere, otherwise the boundary
  // keeps rendering the failure and the app looks frozen until a full reload.
  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.routeKey !== this.props.routeKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="alert alert-critical">
          <strong>خطای غیرمنتظره در رابط کاربری</strong>
          <pre className="code-block" style={{ marginTop: 10 }}>{String(this.state.error)}</pre>
          <button
            className="btn btn-outline btn-sm"
            style={{ marginTop: 12 }}
            onClick={() => this.setState({ error: null })}
          >
            تلاش دوباره
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Layout() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <main className="container">
        {/* routeKey includes the query string so /matching?requestId=1 ->
            ?propertyId=2 also clears a stale error */}
        <ErrorBoundary routeKey={location.pathname + location.search}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<AgentDashboard />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/new" element={<PropertyFormPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
            <Route path="/properties/:id/edit" element={<PropertyFormPage />} />
            <Route path="/requests" element={<BuyerRequestsPage />} />
            <Route path="/requests/new" element={<BuyerRequestFormPage />} />
            <Route path="/matching" element={<MatchingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <footer className="footer">خانه من — سامانه مدیریت و تطابق املاک</footer>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);
