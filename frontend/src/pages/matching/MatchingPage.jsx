import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../api/axios";
import { typeLabel, transactionLabel, formatPrice, scoreClass, apiError } from "../../utils/format";

const BREAKDOWN = [
  { key: "price_score", label: "قیمت", weight: "۲۵٪" },
  { key: "location_score", label: "موقعیت", weight: "۲۰٪" },
  { key: "area_score", label: "متراژ", weight: "۱۵٪" },
  { key: "bedroom_score", label: "اتاق خواب", weight: "۱۰٪" },
  { key: "type_score", label: "نوع ملک", weight: "۱۰٪" },
  { key: "feature_score", label: "امکانات", weight: "۱۰٪" },
  { key: "build_year_score", label: "سال ساخت", weight: "۱۰٪" },
];

function ScoreBars({ m }) {
  return (
    <div className="score-bars">
      {BREAKDOWN.filter((b) => m[b.key] !== undefined).map((b) => (
        <div className="score-bar-row" key={b.key}>
          <span className="score-bar-label">{b.label} <small>({b.weight})</small></span>
          <div className="score-bar-track">
            <div className={`score-bar-fill ${scoreClass(m[b.key])}`} style={{ width: `${m[b.key]}%` }} />
          </div>
          <span className="score-bar-value">{Math.round(m[b.key])}</span>
        </div>
      ))}
    </div>
  );
}

export default function MatchingPage() {
  const [params, setParams] = useSearchParams();
  const requestId = params.get("requestId") || "";
  const propertyId = params.get("propertyId") || "";
  const mode = propertyId ? "property" : "request";

  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.get("/buyer-requests", { params: { status: "all" } })
      .then((r) => setRequests(r.data.buyer_requests || [])).catch(() => {});
    api.get("/properties", { params: { status: "all" } })
      .then((r) => setProperties(r.data.properties || [])).catch(() => {});
  }, []);

  const run = async () => {
    const id = mode === "property" ? propertyId : requestId;
    if (!id) { setResult(null); return; }
    setLoading(true); setError(null);
    try {
      const res = await api.get(`/matches/${mode}/${id}`);
      setResult(res.data);
    } catch (e) { setError(apiError(e, "خطا در محاسبه تطابق")); setResult(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { run(); }, [requestId, propertyId]);

  const runEngine = async () => {
    setMsg(null); setError(null);
    try {
      const res = await api.post("/matches/run");
      setMsg(res.data.message);
      loadSaved();
    } catch (e) { setError(apiError(e)); }
  };

  const loadSaved = async () => {
    try { const res = await api.get("/matches/saved"); setSaved(res.data.matches || []); }
    catch (e) { setError(apiError(e)); }
  };

  const matches = result?.matches || [];

  return (
    <div dir="rtl">
      <div className="section-header">
        <div>
          <h1 className="section-title">⚡ موتور تطابق هوشمند</h1>
          <p className="section-desc">
            تست <code>GET /api/matches/request/:id</code> ، <code>GET /api/matches/property/:id</code> و <code>POST /api/matches/run</code>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-success" onClick={runEngine}>⚡ اجرای کامل موتور و ذخیره</button>
          <button className="btn btn-outline" onClick={loadSaved}>📥 نمایش تطابق‌های ذخیره‌شده</button>
        </div>
      </div>

      {msg && <div className="alert alert-success">✅ {msg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="grid-2">
          <div className="form-group">
            <label>۱) از روی درخواست خریدار (ملک‌های متناسب)</label>
            <select value={mode === "request" ? requestId : ""} onChange={(e) => setParams(e.target.value ? { requestId: e.target.value } : {})}>
              <option value="">— انتخاب درخواست —</option>
              {requests.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} {typeLabel(r.property_type)} / {transactionLabel(r.transaction_type)} — {r.city}{r.district ? ` ${r.district}` : ""} — {r.buyer_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>۲) از روی ملک (خریداران متناسب)</label>
            <select value={mode === "property" ? propertyId : ""} onChange={(e) => setParams(e.target.value ? { propertyId: e.target.value } : {})}>
              <option value="">— انتخاب ملک —</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>#{p.id} {p.title} — {p.city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <p className="muted">در حال محاسبه...</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            نتایج ({matches.length} مورد) — پایه:{" "}
            {mode === "request"
              ? `درخواست #${result.buyer_request?.id} (${result.buyer_request?.buyer_name})`
              : `ملک #${result.property?.id} (${result.property?.title})`}
          </h2>
          {matches.length === 0 && <div className="card">هیچ تطابقی یافت نشد.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
            {matches.map((m, i) => {
              const target = mode === "request" ? m.property : m.buyer_request;
              return (
                <div className="card match-card" key={i}>
                  <div className="match-card-head">
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                        {mode === "request" ? (
                          <Link to={`/properties/${target.id}`}>{target.title}</Link>
                        ) : (
                          <>درخواست #{target.id} — {target.buyer_name}</>
                        )}
                      </h3>
                      <div className="muted" style={{ fontSize: 13 }}>
                        {typeLabel(target.property_type)} • {transactionLabel(target.transaction_type)} •{" "}
                        {target.city}{target.district ? ` - ${target.district}` : ""} •{" "}
                        {mode === "request"
                          ? `${target.area} متر • ${target.transaction_type === "RENT" ? formatPrice(target.deposit) : formatPrice(target.price)}`
                          : `بودجه ${formatPrice(target.min_price)} تا ${formatPrice(target.max_price)}`}
                      </div>
                    </div>
                    <span className={`score-badge lg ${scoreClass(m.score)}`}>{m.score}%</span>
                  </div>
                  <ScoreBars m={m} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {saved.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 12 }}>📥 تطابق‌های ذخیره‌شده در دیتابیس ({saved.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {saved.map((s) => (
              <div className="match-row" key={s.id}>
                <div>
                  <strong>{s.property?.title || `ملک #${s.property_id}`}</strong>
                  <span className="muted"> ↔ درخواست #{s.buyer_request_id} ({s.buyer_request?.buyer_name || "-"})</span>
                </div>
                <span className={`score-badge ${scoreClass(s.score)}`}>{s.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
