import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import StatCard from "../../components/agent/StatCard";
import BuyerRequestCard from "../../components/agent/BuyerRequestCard";
import { useAuth } from "../../context/AuthContext";
import { formatPrice, apiError } from "../../utils/format";

export default function AgentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get("/stats");
      setStats(res.data);
    } catch (err) {
      setError(apiError(err, "خطا در دریافت آمار"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const runEngine = async () => {
    setRunning(true);
    setNotice(null);
    setError(null);
    try {
      const res = await api.post("/matches/run");
      setNotice(res.data.message);
      await fetchStats();
    } catch (err) {
      setError(apiError(err, "خطا در اجرای موتور تطابق"));
    } finally {
      setRunning(false);
    }
  };

  const dash = (v) => (loading ? "—" : v ?? 0);

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="title">داشبورد</h1>
          <p className="lead">
            {user ? `${user.first_name} ${user.last_name}، ` : ""}نمای کلی فایل‌ها، تقاضاها و تطابق‌ها.
          </p>
        </div>
        <div className="row">
          <button onClick={runEngine} disabled={running} className="btn btn-outline">
            {running ? "در حال اجرا" : "اجرای موتور تطابق"}
          </button>
          <Link to="/properties/new" className="btn btn-primary">ثبت ملک</Link>
        </div>
      </header>

      {notice && <div className="alert alert-positive">{notice}</div>}
      {error && <div className="alert alert-critical">{error}</div>}

      <div className="grid-4" style={{ marginBottom: 40 }}>
        <StatCard title="املاک فعال" value={dash(stats.active_properties)} hint={`از ${dash(stats.total_properties)} فایل`} />
        <StatCard title="درخواست‌های باز" value={dash(stats.open_requests)} hint={`از ${dash(stats.total_requests)} درخواست`} />
        <StatCard title="تطابق‌های ذخیره‌شده" value={dash(stats.matches_count)} />
        <StatCard title="امتیاز بالای ۷۰" value={dash(stats.high_matches_count)} hint="تطابق‌های قوی" />
      </div>

      <div className="grid-2">
        <section>
          <div className="section-header">
            <h2 className="subtitle">آخرین املاک</h2>
            <Link to="/properties" className="btn btn-quiet btn-sm">همه املاک</Link>
          </div>

          {loading ? (
            <div className="stack">
              <div className="skeleton skeleton-card" />
              <div className="skeleton skeleton-card" />
            </div>
          ) : stats.recent_properties?.length ? (
            <div className="card">
              {stats.recent_properties.map((p) => (
                <div className="list-row" key={p.id}>
                  <div>
                    <div className="list-row-title">
                      <Link to={`/properties/${p.id}`}>{p.title}</Link>
                    </div>
                    <div className="meta-row">
                      <span>{p.city}{p.district ? `، ${p.district}` : ""}</span>
                      <span className="sep">·</span>
                      <span>{p.area} متر</span>
                      <span className="sep">·</span>
                      <span>{p.transaction_type === "RENT" ? formatPrice(p.deposit) : formatPrice(p.price)}</span>
                    </div>
                  </div>
                  <Link to={`/matching?propertyId=${p.id}`} className="btn btn-outline btn-sm">تطابق</Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="empty-title">هنوز ملکی ثبت نشده</div>
              <p>اولین فایل را ثبت کنید تا موتور تطابق بتواند آن را با تقاضاها مقایسه کند.</p>
              <Link to="/properties/new" className="btn btn-primary">ثبت ملک</Link>
            </div>
          )}
        </section>

        <section>
          <div className="section-header">
            <h2 className="subtitle">آخرین درخواست‌ها</h2>
            <Link to="/requests" className="btn btn-quiet btn-sm">همه درخواست‌ها</Link>
          </div>

          {loading ? (
            <div className="stack">
              <div className="skeleton skeleton-card" />
              <div className="skeleton skeleton-card" />
            </div>
          ) : stats.recent_requests?.length ? (
            <div className="stack">
              {stats.recent_requests.map((r) => (
                <BuyerRequestCard key={r.id} request={r} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="empty-title">درخواستی ثبت نشده</div>
              <p>یک تقاضای خرید ثبت کنید تا نتایج تطابق قابل بررسی شود.</p>
              <Link to="/requests/new" className="btn btn-primary">ثبت درخواست</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
