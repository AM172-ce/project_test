import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, SEED_USERS } from "../../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout, quickLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleQuickSwitch = async (role) => {
    await quickLogin(role);
    navigate("/dashboard");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Quick Test Switcher Bar */}
      <div className="quick-role-bar">
        <span>⚡ <strong>تست سریع با کاربران پیش‌فرض:</strong></span>
        <button
          className="quick-role-btn"
          onClick={() => handleQuickSwitch("AGENT")}
          title="ورود به عنوان مشاور املاک"
        >
          👔 مشاور (علی)
        </button>
        <button
          className="quick-role-btn"
          onClick={() => handleQuickSwitch("BUYER")}
          title="ورود به عنوان خریدار ملک"
        >
          👤 خریدار (رضا)
        </button>
        <button
          className="quick-role-btn"
          onClick={() => handleQuickSwitch("ADMIN")}
          title="ورود به عنوان مدیر سیستم"
        >
          🛡️ مدیر سیستم
        </button>
      </div>

      {/* Main Navbar */}
      <header className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <span>🏠</span>
            <span>خانه من</span>
          </Link>

          <nav>
            <ul className="navbar-links">
              <li>
                <Link to="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>
                  📊 داشبورد
                </Link>
              </li>
              <li>
                <Link to="/properties" className={`nav-link ${isActive("/properties") ? "active" : ""}`}>
                  🏢 املاک
                </Link>
              </li>
              <li>
                <Link to="/requests" className={`nav-link ${isActive("/requests") ? "active" : ""}`}>
                  🎯 درخواست‌های خرید
                </Link>
              </li>
              <li>
                <Link to="/matching" className={`nav-link ${isActive("/matching") ? "active" : ""}`}>
                  ⚡ موتور تطابق
                </Link>
              </li>
            </ul>
          </nav>

          <div className="navbar-actions">
            <Link to="/properties/new" className="btn btn-outline btn-sm">
              ➕ ثبت ملک
            </Link>
            <Link to="/requests/new" className="btn btn-outline btn-sm">
              ➕ ثبت درخواست
            </Link>

            {isAuthenticated ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="user-badge">
                  <span>{user?.first_name} {user?.last_name}</span>
                  <span className={`role-tag ${user?.role?.toLowerCase()}`}>
                    {user?.role === "ADMIN" ? "مدیر" : user?.role === "AGENT" ? "مشاور" : "خریدار"}
                  </span>
                </div>
                <button onClick={logout} className="btn btn-outline btn-sm" style={{ color: "var(--danger)" }}>
                  خروج
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <Link to="/login" className="btn btn-primary btn-sm">
                  ورود
                </Link>
                <Link to="/register" className="btn btn-outline btn-sm">
                  ثبت‌نام
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
