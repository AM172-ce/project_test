import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { PROPERTY_TYPES, TRANSACTION_TYPES, FEATURES, apiError } from "../../utils/format";

const BLANK = {
  title: "", property_type: "APARTMENT", transaction_type: "SALE",
  province: "البرز", city: "کرج", district: "", address: "",
  area: "", bedrooms: "", floor: "", total_floors: "", build_year: "",
  price: "", deposit: "", rent: "", description: "",
  latitude: "", longitude: "", features: [],
};

const SAMPLE = {
  ...BLANK,
  title: "آپارتمان تست ۱۰۰ متری",
  district: "گوهردشت", address: "خیابان نمونه، پلاک ۱",
  area: 100, bedrooms: 2, floor: 3, total_floors: 6, build_year: 1400,
  price: 6000000000, description: "ملک تستی ساخته‌شده از فرم فرانت‌اند.",
  latitude: 35.8327, longitude: 50.9916, features: ["PARKING", "ELEVATOR"],
};

const NUM_INT = ["area", "bedrooms", "floor", "total_floors", "build_year", "price", "deposit", "rent"];
const NUM_FLOAT = ["latitude", "longitude"];

export default function PropertyFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api.get(`/properties/${id}`).then((res) => {
      const p = res.data.property;
      const next = { ...BLANK };
      Object.keys(BLANK).forEach((k) => { next[k] = p[k] ?? (k === "features" ? [] : ""); });
      setForm(next);
    }).catch((e) => setError(apiError(e)));
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const toggleFeature = (f) =>
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(f)
        ? prev.features.filter((x) => x !== f)
        : [...prev.features, f],
    }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!isAuthenticated) { setError("برای ثبت ملک ابتدا وارد شوید (دکمه‌های ورود سریع بالای صفحه)."); return; }
    setSaving(true);
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (k === "features") { payload.features = v; return; }
        if (v === "" || v === null) return;
        if (NUM_INT.includes(k)) payload[k] = parseInt(v, 10);
        else if (NUM_FLOAT.includes(k)) payload[k] = parseFloat(v);
        else payload[k] = v;
      });
      const res = editing
        ? await api.put(`/properties/${id}`, payload)
        : await api.post("/properties", payload);
      navigate(`/properties/${res.data.property.id}`);
    } catch (err) {
      const errs = err?.response?.data?.errors;
      setError(errs ? JSON.stringify(errs) : apiError(err, "خطا در ذخیره ملک"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl">
      <div className="section-header">
        <div>
          <h1 className="section-title">{editing ? "✏️ ویرایش ملک" : "➕ ثبت ملک جدید"}</h1>
          <p className="section-desc">
            تست <code>{editing ? `PUT /api/properties/${id}` : "POST /api/properties"}</code> (نیازمند JWT)
          </p>
        </div>
        {!editing && (
          <button type="button" className="btn btn-outline" onClick={() => setForm(SAMPLE)}>
            🧪 پر کردن با داده نمونه
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {!isAuthenticated && (
        <div className="alert alert-warning">
          وارد نشده‌اید. <Link to="/login">ورود</Link> یا از نوار «تست سریع» بالای صفحه استفاده کنید.
        </div>
      )}

      <form className="card" onSubmit={submit}>
        <div className="form-group">
          <label>عنوان *</label>
          <input value={form.title} onChange={set("title")} required />
        </div>

        <div className="grid-3">
          <div className="form-group"><label>نوع ملک *</label>
            <select value={form.property_type} onChange={set("property_type")}>
              {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select></div>
          <div className="form-group"><label>نوع معامله *</label>
            <select value={form.transaction_type} onChange={set("transaction_type")}>
              {TRANSACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select></div>
          <div className="form-group"><label>متراژ (متر) *</label>
            <input type="number" value={form.area} onChange={set("area")} required /></div>
        </div>

        <div className="grid-3">
          <div className="form-group"><label>استان</label><input value={form.province} onChange={set("province")} /></div>
          <div className="form-group"><label>شهر *</label><input value={form.city} onChange={set("city")} required /></div>
          <div className="form-group"><label>محله</label><input value={form.district} onChange={set("district")} /></div>
        </div>

        <div className="form-group"><label>آدرس</label><input value={form.address} onChange={set("address")} /></div>

        <div className="grid-4">
          <div className="form-group"><label>اتاق خواب</label><input type="number" value={form.bedrooms} onChange={set("bedrooms")} /></div>
          <div className="form-group"><label>طبقه</label><input type="number" value={form.floor} onChange={set("floor")} /></div>
          <div className="form-group"><label>تعداد طبقات</label><input type="number" value={form.total_floors} onChange={set("total_floors")} /></div>
          <div className="form-group"><label>سال ساخت</label><input type="number" value={form.build_year} onChange={set("build_year")} /></div>
        </div>

        <div className="grid-3">
          <div className="form-group"><label>قیمت فروش (تومان)</label><input type="number" value={form.price} onChange={set("price")} /></div>
          <div className="form-group"><label>ودیعه</label><input type="number" value={form.deposit} onChange={set("deposit")} /></div>
          <div className="form-group"><label>اجاره ماهانه</label><input type="number" value={form.rent} onChange={set("rent")} /></div>
        </div>

        <div className="grid-2">
          <div className="form-group"><label>عرض جغرافیایی (latitude)</label><input value={form.latitude} onChange={set("latitude")} placeholder="35.8327" /></div>
          <div className="form-group"><label>طول جغرافیایی (longitude)</label><input value={form.longitude} onChange={set("longitude")} placeholder="50.9916" /></div>
        </div>

        <div className="form-group">
          <label>امکانات</label>
          <div className="chip-row">
            {FEATURES.map((f) => (
              <button type="button" key={f.value}
                className={`chip chip-toggle ${form.features.includes(f.value) ? "active" : ""}`}
                onClick={() => toggleFeature(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>توضیحات</label>
          <textarea rows={4} value={form.description} onChange={set("description")} />
        </div>

        <button className="btn btn-primary" disabled={saving}>
          {saving ? "در حال ذخیره..." : editing ? "ذخیره تغییرات" : "ثبت ملک"}
        </button>
      </form>
    </div>
  );
}
