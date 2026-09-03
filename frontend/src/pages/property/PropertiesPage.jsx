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
    <div>
      <header className="page-header">
        <div>
          <h1 className="title">املاک</h1>
          <p className="lead">جستجو و فیلتر میان فایل‌های ثبت‌شده.</p>
        </div>
        <Link to="/properties/new" className="btn btn-primary">ثبت ملک</Link>
      </header>

      <div className="filters">
        <div className="filters-grid">
          <div className="form-group">
            <label>جستجو</label>
            <input value={filters.search} onChange={set("search")} placeholder="عنوان یا توضیحات" />
          </div>
          <div className="form-group">
            <label>شهر</label>
            <input value={filters.city} onChange={set("city")} placeholder="کرج" />
          </div>
          <div className="form-group">
            <label>محله</label>
            <input value={filters.district} onChange={set("district")} />
          </div>
          <div className="form-group">
            <label>نوع ملک</label>
            <select value={filters.property_type} onChange={set("property_type")}>
              <option value="">همه</option>
              {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>نوع معامله</label>
            <select value={filters.transaction_type} onChange={set("transaction_type")}>
              <option value="">همه</option>
              {TRANSACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>حداقل قیمت</label>
            <input type="number" value={filters.min_price} onChange={set("min_price")} />
          </div>
          <div className="form-group">
            <label>حداکثر قیمت</label>
            <input type="number" value={filters.max_price} onChange={set("max_price")} />
          </div>
          <div className="form-group">
            <label>حداقل متراژ</label>
            <input type="number" value={filters.min_area} onChange={set("min_area")} />
          </div>
          <div className="form-group">
            <label>حداکثر متراژ</label>
            <input type="number" value={filters.max_area} onChange={set("max_area")} />
          </div>
          <div className="form-group">
            <label>وضعیت</label>
            <select value={filters.status} onChange={set("status")}>
              <option value="all">همه</option>
              <option value="ACTIVE">فعال</option>
              <option value="SOLD">فروخته‌شده</option>
              <option value="ARCHIVED">آرشیو</option>
            </select>
          </div>
        </div>
        <div className="filters-actions">
          <button className="btn btn-primary btn-sm" onClick={() => load()}>اعمال فیلتر</button>
          <button className="btn btn-outline btn-sm" onClick={() => { setFilters(EMPTY); load(EMPTY); }}>
            بازنشانی
          </button>
        </div>
      </div>

      {error && <div className="alert alert-critical">{error}</div>}

      {loading ? (
        <div className="grid-3">
          {[0, 1, 2].map((i) => <div className="skeleton" style={{ height: 300, borderRadius: 18 }} key={i} />)}
        </div>
      ) : items.length ? (
        <>
          <p className="muted num" style={{ marginBottom: 18 }}>{items.length} ملک</p>
          <div className="grid-3">
            {items.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </>
      ) : (
        <div className="empty">
          <div className="empty-title">ملکی یافت نشد</div>
          <p>فیلترها را بازنشانی کنید یا یک فایل جدید ثبت کنید.</p>
          <Link to="/properties/new" className="btn btn-primary">ثبت ملک</Link>
        </div>
      )}
    </div>
  );
}
