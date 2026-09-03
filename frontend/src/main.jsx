import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

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
  constructor(p) { super(p); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="alert alert-critical">
          <strong>خطای غیرمنتظره در رابط کاربری</strong>
          <pre className="code-block" style={{ marginTop: 10 }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="container">
          <ErrorBoundary>
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
      </AuthProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);
