import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/agent/StatCard";
import BuyerRequestCard from "../../components/agent/BuyerRequestCard";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function AgentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    active_properties: 0,
    open_requests: 0,
    matches_count: 0,
    high_matches_count: 0,
    recent_properties: [],
    recent_requests: [],
  });
  const [loading, setLoading] = useState(true);
  const [runningEngine, setRunningEngine] = useState(false);
  const [engineMessage, setEngineMessage] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get("/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRunEngine = async () => {
    setRunningEngine(true);
    setEngineMessage(null);
    try {
      const res = await api.post("/matches/run");
      setEngineMessage(res.data.message);
      await fetchStats();
    } catch (err) {
      setEngineMessage("خطا در اجرای موتور تطابق.");
    } finally {
      setRunningEngine(false);
    }
  };

  const formatPrice = (val) => {
    if (!val) return "توافقی";
    if (val >= 1000000000) return `${(val / 1000000000).toLocaleString("fa-IR")} میلیارد تومان`;
    if (val >= 1000000) return `${(val / 1000000).toLocaleString("fa-IR")} میلیون تومان`;
    return `${val.toLocaleString("fa-IR")} تومان`;
  };

  return (
    <div dir="rtl">
      {/* Dashboard Top Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">📊 داشبورد مشاور املاک</h1>
          <p className="section-desc">
            خوش آمدید{user ? `، ${user.first_name} ${user.last_name}` : ""}! نمای کلی از فایل‌ها، تقاضاهای خریداران و تطابق‌های هوشمند.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={handleRunEngine}
            disabled={runningEngine}
            className="btn btn-success"
          >
            {runningEngine ? "در حال تطابق..." : "⚡ اجرای موتور تطابق هوشمند"}
          </button>
          <Link to="/properties/new" className="btn btn-primary">
            ➕ ثبت ملک جدید
          </Link>
        </div>
      </div>

      {engineMessage && (
        <div className="alert alert-success">
          <span>✅ {engineMessage}</span>
        </div>
      )}

      {/* 4 Core StatCards as originally intended */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard
          title="املاک فعال"
          value={loading ? "..." : stats.active_properties}
          icon="🏠"
        />
        <StatCard
          title="درخواست‌های جدید"
          value={loading ? "..." : stats.open_requests}
          icon="🎯"
        />
        <StatCard
          title="تطابق‌های هوشمند"
          value={loading ? "..." : stats.matches_count}
          icon="📨"
        />
        <StatCard
          title="تطابق‌های با امتیاز بالا"
          value={loading ? "..." : stats.high_matches_count}
          icon="⭐"
        />
      </div>

      {/* Two Column Layout: Recent Properties & Recent Requests */}
      <div className="grid-2" style={{ gap: 24, marginBottom: 28 }}>
        {/* Recent Properties */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>🏢 آخرین فایل‌های ثبت‌شده</h2>
            <Link to="/properties" style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600 }}>
              مشاهده همه ←
            </Link>
          </div>

          {stats.recent_properties && stats.recent_properties.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stats.recent_properties.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: 12,
                    background: "#f8fafc",
                    borderRadius: 8,
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                      <Link to={`/properties/${p.id}`} style={{ color: "var(--text-main)" }}>
                        {p.title}
                      </Link>
                    </h3>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 8 }}>
                      <span>📍 {p.city} - {p.district}</span>
                      <span>•</span>
                      <span>📐 {p.area} متر</span>
                      <span>•</span>
                      <strong style={{ color: "var(--primary)" }}>
                        {p.transaction_type === "RENT" ? `ودیعه: ${formatPrice(p.deposit)}` : formatPrice(p.price)}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <Link to={`/properties/${p.id}`} className="btn btn-outline btn-sm">
                      مشاهده
                    </Link>
                    <Link to={`/matching?propertyId=${p.id}`} className="btn btn-primary btn-sm">
                      تطابق ⚡
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>هیچ ملکی هنوز ثبت نشده است.</p>
          )}
        </div>

        {/* Recent Buyer Requests */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>🎯 آخرین درخواست‌های خریداران</h2>
            <Link to="/requests" style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600 }}>
              مشاهده همه ←
            </Link>
          </div>

          {stats.recent_requests && stats.recent_requests.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stats.recent_requests.map((r) => (
                <BuyerRequestCard key={r.id} request={r} />
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>درخواست خریدی هنوز ثبت نشده است.</p>
          )}
        </div>
      </div>
    </div>
  );
}
