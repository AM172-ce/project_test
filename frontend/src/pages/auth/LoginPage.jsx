import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, SEED_USERS } from "../../context/AuthContext";

const ROLE_LABELS = { ADMIN: "مدیر", AGENT: "مشاور", BUYER: "خریدار" };

export default function LoginPage() {
  const { login, quickLogin, loading } = useAuth();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("09120000002");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await login(mobile, password);
    if (res.success) navigate("/dashboard");
    else setError(res.error);
  };

  const quick = async (role) => {
    setError(null);
    const res = await quickLogin(role);
    if (res?.success) navigate("/dashboard");
    else setError(res?.error);
  };

  return (
    <div className="narrow">
      <h1 className="title" style={{ textAlign: "center", marginBottom: 8 }}>ورود</h1>
      <p className="muted" style={{ textAlign: "center", marginBottom: 28 }}>
        با شماره موبایل و رمز عبور خود وارد شوید.
      </p>

      {error && <div className="alert alert-critical">{error}</div>}

      <form onSubmit={submit} className="card">
        <div className="form-group">
          <label htmlFor="mobile">شماره موبایل</label>
          <input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} autoComplete="username" />
        </div>
        <div className="form-group">
          <label htmlFor="password">رمز عبور</label>
          <input id="password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading} type="submit">
          {loading ? "در حال ورود" : "ورود"}
        </button>
      </form>

      <div className="card card-quiet" style={{ marginTop: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>حساب‌های آزمایشی</div>
        <div className="stack">
          {Object.entries(SEED_USERS).map(([role, u]) => (
            <button key={role} className="btn btn-outline btn-sm btn-block" onClick={() => quick(role)}>
              {ROLE_LABELS[role]} — {u.mobile}
            </button>
          ))}
        </div>
      </div>

      <p className="muted" style={{ textAlign: "center", marginTop: 20 }}>
        حساب ندارید؟ <Link to="/register" style={{ color: "var(--accent)" }}>ثبت‌نام کنید</Link>
      </p>
    </div>
  );
}
