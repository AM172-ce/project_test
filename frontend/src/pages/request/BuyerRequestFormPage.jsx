import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { PROPERTY_TYPES, TRANSACTION_TYPES, FEATURES, apiError } from "../../utils/format";

const BLANK = {
  property_type: "APARTMENT", transaction_type: "SALE",
  province: "البرز", city: "کرج", district: "",
  min_area: "", max_area: "", bedrooms: "",
  min_price: "", max_price: "", description: "", features: [],
};

const SAMPLE = {
  ...BLANK, district: "گوهردشت", min_area: 90, max_area: 140, bedrooms: 2,
  min_price: 4000000000, max_price: 8000000000,
  description: "درخواست تستی ساخته‌شده از فرم فرانت‌اند.",
  features: ["PARKING", "ELEVATOR"],
};

const NUMS = ["min_area", "max_area", "bedrooms", "min_price", "max_price"];

export default function BuyerRequestFormPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggleFeature = (f) => setForm((prev) => ({
    ...prev,
    features: prev.features.includes(f) ? prev.features.filter((x) => x !== f) : [...prev.features, f],
  }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!isAuthenticated) { setError("برای ثبت درخواست ابتدا وارد شوید (ترجیحاً با کاربر خریدار)."); return; }
    setSaving(true);
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (k === "features") { payload.features = v; return; }
        if (v === "") return;
        payload[k] = NUMS.includes(k) ? parseInt(v, 10) : v;
      });
      await api.post("/buyer-requests", payload);
      navigate("/requests");
    } catch (err) { setError(apiError(err, "خطا در ثبت درخواست")); }
    finally { setSaving(false); }
  };

  return (
    <div dir="rtl">
      <div className="section-header">
        <div>
          <h1 className="section-title">➕ ثبت درخواست خرید</h1>
          <p className="section-desc">تست <code>POST /api/buyer-requests</code> (نیازمند JWT)</p>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => setForm(SAMPLE)}>🧪 داده نمونه</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {!isAuthenticated && (
        <div className="alert alert-warning">
          وارد نشده‌اید. <Link to="/login">ورود</Link> یا دکمه «👤 خریدار (رضا)» در نوار بالا.
        </div>
      )}

      <form className="card" onSubmit={submit}>
        <div className="grid-2">
          <div className="form-group"><label>نوع ملک *</label>
            <select value={form.property_type} onChange={set("property_type")}>
              {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select></div>
          <div className="form-group"><label>نوع معامله *</label>
            <select value={form.transaction_type} onChange={set("transaction_type")}>
              {TRANSACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select></div>
        </div>

        <div className="grid-3">
          <div className="form-group"><label>استان</label><input value={form.province} onChange={set("province")} /></div>
          <div className="form-group"><label>شهر *</label><input value={form.city} onChange={set("city")} required /></div>
          <div className="form-group"><label>محله</label><input value={form.district} onChange={set("district")} /></div>
        </div>

        <div className="grid-3">
          <div className="form-group"><label>حداقل متراژ</label><input type="number" value={form.min_area} onChange={set("min_area")} /></div>
          <div className="form-group"><label>حداکثر متراژ</label><input type="number" value={form.max_area} onChange={set("max_area")} /></div>
          <div className="form-group"><label>اتاق خواب</label><input type="number" value={form.bedrooms} onChange={set("bedrooms")} /></div>
        </div>

        <div className="grid-2">
          <div className="form-group"><label>حداقل بودجه (تومان)</label><input type="number" value={form.min_price} onChange={set("min_price")} /></div>
          <div className="form-group"><label>حداکثر بودجه (تومان)</label><input type="number" value={form.max_price} onChange={set("max_price")} /></div>
        </div>

        <div className="form-group">
          <label>امکانات مورد نیاز</label>
          <div className="chip-row">
            {FEATURES.map((f) => (
              <button type="button" key={f.value}
                className={`chip chip-toggle ${form.features.includes(f.value) ? "active" : ""}`}
                onClick={() => toggleFeature(f.value)}>{f.label}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>توضیحات</label>
          <textarea rows={3} value={form.description} onChange={set("description")} />
        </div>

        <button className="btn btn-primary" disabled={saving}>{saving ? "..." : "ثبت درخواست"}</button>
      </form>
    </div>
  );
}
