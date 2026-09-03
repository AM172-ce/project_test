import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import BuyerRequestCard from "../../components/agent/BuyerRequestCard";
import { PROPERTY_TYPES, TRANSACTION_TYPES, apiError } from "../../utils/format";

const EMPTY = { city: "", district: "", property_type: "", transaction_type: "", status: "all" };

export default function BuyerRequestsPage() {
  const [filters, setFilters] = useState(EMPTY);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async (f = filters) => {
    setLoading(true); setError(null);
    try {
      const params = {};
      Object.entries(f).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await api.get("/buyer-requests", { params });
      setItems(res.data.buyer_requests || []);
    } catch (e) { setError(apiError(e, "خطا در دریافت درخواست‌ها")); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <div dir="rtl">
      <div className="section-header">
        <div>
          <h1 className="section-title">🎯 درخواست‌های خرید</h1>
          <p className="section-desc">تست <code>GET /api/buyer-requests</code></p>
        </div>
        <Link to="/requests/new" className="btn btn-primary">➕ ثبت درخواست جدید</Link>
      </div>

      <div className="card filters">
        <div className="filters-grid">
          <div className="form-group"><label>شهر</label><input value={filters.city} onChange={set("city")} /></div>
          <div className="form-group"><label>محله</label><input value={filters.district} onChange={set("district")} /></div>
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
          <div className="form-group"><label>وضعیت</label>
            <select value={filters.status} onChange={set("status")}>
              <option value="all">همه</option>
              <option value="OPEN">باز</option>
              <option value="CLOSED">بسته</option>
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
          <p className="muted" style={{ marginBottom: 12 }}>{items.length} درخواست یافت شد.</p>
          <div className="grid-2">
            {items.map((r) => <BuyerRequestCard key={r.id} request={r} />)}
          </div>
          {items.length === 0 && <div className="card">درخواستی یافت نشد. اجرای <code>python seed.py</code> داده نمونه می‌سازد.</div>}
        </>
      )}
    </div>
  );
}
