import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, SEED_USERS } from "../../context/AuthContext";

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

  return (
    <div dir="rtl" className="narrow">
      <div className="card">
        <h1 className="section-title">🔐 ورود به سیستم</h1>
        <p className="section-desc">تست endpoint: <code>POST /api/auth/login</code></p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>شماره موبایل</label>
            <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="09120000002" />
          </div>
          <div className="form-group">
            <label>رمز عبور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? "..." : "ورود"}
          </button>
        </form>

        <hr style={{ margin: "20px 0", borderColor: "var(--border-color)" }} />
        <p style={{ fontSize: 13, marginBottom: 8 }}>ورود سریع با کاربران seed:</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.keys(SEED_USERS).map((r) => (
            <button key={r} className="btn btn-outline btn-sm"
              onClick={async () => { const res = await quickLogin(r); if (res?.success) navigate("/dashboard"); else setError(res?.error); }}>
              {SEED_USERS[r].name}
            </button>
          ))}
        </div>
        <p style={{ marginTop: 16, fontSize: 13 }}>
          حساب ندارید؟ <Link to="/register" style={{ color: "var(--primary)" }}>ثبت‌نام</Link>
        </p>
      </div>
    </div>
  );
}
