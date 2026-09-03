import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "", last_name: "", mobile: "", email: "", password: "Password123!",
  });
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await register(form);
    if (res.success) navigate("/dashboard");
    else setError(res.error);
  };

  return (
    <div dir="rtl" className="narrow">
      <div className="card">
        <h1 className="section-title">📝 ثبت‌نام</h1>
        <p className="section-desc">تست endpoint: <code>POST /api/auth/register</code></p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={submit}>
          <div className="grid-2">
            <div className="form-group">
              <label>نام *</label>
              <input value={form.first_name} onChange={set("first_name")} required />
            </div>
            <div className="form-group">
              <label>نام خانوادگی *</label>
              <input value={form.last_name} onChange={set("last_name")} required />
            </div>
          </div>
          <div className="form-group">
            <label>موبایل *</label>
            <input value={form.mobile} onChange={set("mobile")} placeholder="09121234567" required />
          </div>
          <div className="form-group">
            <label>ایمیل</label>
            <input type="email" value={form.email} onChange={set("email")} />
          </div>
          <div className="form-group">
            <label>رمز عبور *</label>
            <input type="password" value={form.password} onChange={set("password")} required />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "..." : "ثبت‌نام"}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 13 }}>
          حساب دارید؟ <Link to="/login" style={{ color: "var(--primary)" }}>ورود</Link>
        </p>
      </div>
    </div>
  );
}
