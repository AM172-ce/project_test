import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import PropertyCard from "../../components/property/PropertyCard";
import { PROPERTY_TYPES, TRANSACTION_TYPES, apiError } from "../../utils/format";

const EMPTY = {
  search: "", city: "", district: "", property_type: "", transaction_type: "",
  min_price: "", max_price: "", min_area: "", max_area: "", bedrooms: "", status: "all",
};

export default function PropertiesPage() {
  const [filters, setFilters] = useState(EMPTY);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async (f = filters) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      Object.entries(f).forEach(([k, v]) => { if (v !== "" && v !== null) params[k] = v; });
      const res = await api.get("/properties", { params });
      setItems(res.data.properties || []);
    } catch (err) {
      setError(apiError(err, "خطا در دریافت لیست املاک"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <div dir="rtl">
      <div className="section-header">
        <div>
          <h1 className="section-title">🏢 لیست املاک</h1>
          <p className="section-desc">تست <code>GET /api/properties</code> با فیلترها</p>
        </div>
        <Link to="/properties/new" className="btn btn-primary">➕ ثبت ملک جدید</Link>
      </div>

      <div className="card filters">
        <div className="filters-grid">
          <div className="form-group"><label>جستجو (عنوان/توضیحات)</label>
            <input value={filters.search} onChange={set("search")} /></div>
          <div className="form-group"><label>شهر</label>
            <input value={filters.city} onChange={set("city")} placeholder="کرج" /></div>
          <div className="form-group"><label>محله</label>
            <input value={filters.district} onChange={set("district")} /></div>
          <div className="form-group"><label>نوع ملک</label>
            <select value={filters.property_type} onChange={set("property_type")}>
              <option value="">همه</option>
              {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select></div>
          <div className="form-group"><label>نوع معامله</label>
            <select value={filters.transaction_type} onChange={set("transaction_type")}>
              <option value="">همه</option>
              {TRANSACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select></div>
          <div className="form-group"><label>حداقل قیمت</label>
            <input type="number" value={filters.min_price} onChange={set("min_price")} /></div>
          <div className="form-group"><label>حداکثر قیمت</label>
            <input type="number" value={filters.max_price} onChange={set("max_price")} /></div>
          <div className="form-group"><label>حداقل متراژ</label>
            <input type="number" value={filters.min_area} onChange={set("min_area")} /></div>
          <div className="form-group"><label>حداکثر متراژ</label>
            <input type="number" value={filters.max_area} onChange={set("max_area")} /></div>
          <div className="form-group"><label>وضعیت</label>
            <select value={filters.status} onChange={set("status")}>
              <option value="all">همه</option>
              <option value="ACTIVE">فعال</option>
              <option value="SOLD">فروخته‌شده</option>
              <option value="ARCHIVED">آرشیو</option>
            </select></div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button className="btn btn-primary btn-sm" onClick={() => load()}>🔍 اعمال فیلتر</button>
          <button className="btn btn-outline btn-sm" onClick={() => { setFilters(EMPTY); load(EMPTY); }}>پاک کردن</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? <p className="muted">در حال بارگذاری...</p> : (
        <>
          <p className="muted" style={{ marginBottom: 12 }}>{items.length} ملک یافت شد.</p>
          <div className="grid-3">
            {items.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
          {items.length === 0 && <div className="card">هیچ ملکی مطابق فیلترها یافت نشد. اگر دیتابیس خالی است، دستور <code>docker compose exec backend python seed.py</code> را اجرا کنید.</div>}
        </>
      )}
    </div>
  );
}
