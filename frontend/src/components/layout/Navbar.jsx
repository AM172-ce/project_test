import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth, SEED_USERS } from "../../context/AuthContext";

const LINKS = [
  { to: "/dashboard", label: "داشبورد" },
  { to: "/properties", label: "املاک" },
  { to: "/requests", label: "درخواست‌ها" },
  { to: "/matching", label: "تطابق" },
];

const ROLE_LABELS = { ADMIN: "مدیر", AGENT: "مشاور", BUYER: "خریدار" };

export default function Navbar() {
  const { user, isAuthenticated, logout, quickLogin } = useAuth();
  const navigate = useNavigate();

  const switchTo = async (role) => {
    await quickLogin(role);
    navigate("/dashboard");
  };

  return (
    <>
      <div className="utility-bar">
        <div className="utility-bar-inner">
          <span className="utility-bar-label">ورود سریع برای تست</span>
          {Object.entries(SEED_USERS).map(([role, u]) => (
            <button key={role} className="utility-btn" onClick={() => switchTo(role)}>
              {ROLE_LABELS[role]} — {u.mobile}
            </button>
          ))}
        </div>
      </div>

      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand">خانه من</Link>

          <nav>
            <ul className="nav-links">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <span className="identity">
                  {user?.first_name} {user?.last_name}
                  <span className="role-tag">{ROLE_LABELS[user?.role] || user?.role}</span>
                </span>
                <button onClick={logout} className="btn btn-outline btn-sm">خروج</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-quiet btn-sm">ورود</Link>
                <Link to="/register" className="btn btn-primary btn-sm">ثبت‌نام</Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
