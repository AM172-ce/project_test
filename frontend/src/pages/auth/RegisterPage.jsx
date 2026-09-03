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
    <div className="narrow">
      <h1 className="title" style={{ textAlign: "center", marginBottom: 8 }}>ایجاد حساب</h1>
      <p className="muted" style={{ textAlign: "center", marginBottom: 28 }}>
        حساب جدید به صورت پیش‌فرض با نقش خریدار ساخته می‌شود.
      </p>

      {error && <div className="alert alert-critical">{error}</div>}

      <form onSubmit={submit} className="card">
        <div className="form-group">
          <label htmlFor="fn">نام</label>
          <input id="fn" value={form.first_name} onChange={set("first_name")} required />
        </div>
        <div className="form-group">
          <label htmlFor="ln">نام خانوادگی</label>
          <input id="ln" value={form.last_name} onChange={set("last_name")} required />
        </div>
        <div className="form-group">
          <label htmlFor="mb">شماره موبایل</label>
          <input id="mb" value={form.mobile} onChange={set("mobile")} placeholder="09121234567" required />
        </div>
        <div className="form-group">
          <label htmlFor="em">ایمیل <span className="muted">(اختیاری)</span></label>
          <input id="em" type="email" value={form.email} onChange={set("email")} />
        </div>
        <div className="form-group">
          <label htmlFor="pw">رمز عبور</label>
          <input id="pw" type="password" value={form.password} onChange={set("password")} required />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "در حال ثبت" : "ثبت‌نام"}
        </button>
      </form>

      <p className="muted" style={{ textAlign: "center", marginTop: 20 }}>
        قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login" style={{ color: "var(--accent)" }}>ورود</Link>
      </p>
    </div>
  );
}
