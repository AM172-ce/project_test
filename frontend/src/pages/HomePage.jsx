import React from "react";
import { Link } from "react-router-dom";
import { useAuth, SEED_USERS } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CARDS = [
  { to: "/dashboard", icon: "📊", title: "داشبورد و آمار", desc: "آمار املاک، درخواست‌ها و تطابق‌ها (GET /api/stats) و اجرای موتور تطابق." },
  { to: "/properties", icon: "🏢", title: "لیست املاک", desc: "جستجو و فیلتر روی GET /api/properties." },
  { to: "/properties/new", icon: "➕", title: "ثبت ملک جدید", desc: "POST /api/properties + آپلود تصویر و مختصات نقشه." },
  { to: "/requests", icon: "🎯", title: "درخواست‌های خرید", desc: "GET /api/buyer-requests و ثبت درخواست جدید." },
  { to: "/matching", icon: "⚡", title: "موتور تطابق", desc: "امتیازدهی ملک/درخواست با GET /api/matches/*." },
  { to: "/login", icon: "🔐", title: "ورود / ثبت‌نام", desc: "تست JWT با کاربران seed یا کاربر جدید." },
];

export default function HomePage() {
  const { quickLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div dir="rtl">
      <div className="hero">
        <h1>🏠 خانه من — پنل تست کامل</h1>
        <p>
          این رابط برای تست تمام قابلیت‌های بک‌اند ساخته شده است: احراز هویت JWT، مدیریت املاک،
          آپلود تصویر، درخواست خریداران و موتور تطابق هوشمند.
        </p>
        {isAuthenticated ? (
          <p className="hero-note">وارد شده‌اید به عنوان <strong>{user?.first_name} {user?.last_name}</strong> ({user?.role})</p>
        ) : (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            {Object.keys(SEED_USERS).map((r) => (
              <button
                key={r}
                className="btn btn-primary"
                onClick={async () => { await quickLogin(r); navigate("/dashboard"); }}
              >
                ورود سریع: {SEED_USERS[r].name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid-3">
        {CARDS.map((c) => (
          <Link to={c.to} key={c.to} className="card feature-card">
            <div className="feature-icon">{c.icon}</div>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </Link>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 10 }}>ℹ️ راهنمای اجرا</h3>
        <pre className="code-block">{`docker compose up --build
docker compose exec backend python seed.py

frontend: http://localhost:5173
backend health: http://localhost:5000/health

کاربران seed (رمز همه: Password123!)
ADMIN 09120000001 | AGENT 09120000002 | BUYER 09120000003`}</pre>
      </div>
    </div>
  );
}
