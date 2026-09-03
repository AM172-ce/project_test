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
          <span className="score-bar-label">
            {b.label} <small>{b.weight}</small>
          </span>
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
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    api.get("/buyer-requests", { params: { status: "all" } })
      .then((r) => setRequests(r.data.buyer_requests || [])).catch(() => {});
    api.get("/properties", { params: { status: "all" } })
      .then((r) => setProperties(r.data.properties || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const id = mode === "property" ? propertyId : requestId;
    if (!id) { setResult(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.get(`/matches/${mode}/${id}`)
      .then((res) => { if (!cancelled) setResult(res.data); })
      .catch((e) => { if (!cancelled) { setError(apiError(e, "خطا در محاسبه تطابق")); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [requestId, propertyId, mode]);

  const runEngine = async () => {
    setNotice(null);
    setError(null);
    try {
      const res = await api.post("/matches/run");
      setNotice(res.data.message);
      loadSaved();
    } catch (e) {
      setError(apiError(e));
    }
  };

  const loadSaved = async () => {
    try {
      const res = await api.get("/matches/saved");
      setSaved(res.data.matches || []);
    } catch (e) {
      setError(apiError(e));
    }
  };

  const matches = result?.matches || [];

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="title">موتور تطابق</h1>
          <p className="lead">
            امتیاز هر تطابق از هفت معیار وزن‌دار محاسبه می‌شود؛ مجموع وزن‌ها ۱۰۰ درصد است.
          </p>
        </div>
        <div className="row">
          <button className="btn btn-outline" onClick={loadSaved}>تطابق‌های ذخیره‌شده</button>
          <button className="btn btn-primary" onClick={runEngine}>اجرای موتور</button>
        </div>
      </header>

      {notice && <div className="alert alert-positive">{notice}</div>}
      {error && <div className="alert alert-critical">{error}</div>}

      <div className="filters">
        <div className="grid-2">
          <div className="form-group">
            <label>بر اساس درخواست خریدار</label>
            <select value={mode === "request" ? requestId : ""}
              onChange={(e) => setParams(e.target.value ? { requestId: e.target.value } : {})}>
              <option value="">انتخاب کنید</option>
              {requests.map((r) => (
                <option key={r.id} value={r.id}>
                  {typeLabel(r.property_type)} — {r.city}{r.district ? `، ${r.district}` : ""} — {r.buyer_name}
                </option>
              ))}
            </select>
            <div className="form-hint">املاک متناسب با این تقاضا نمایش داده می‌شود.</div>
          </div>
          <div className="form-group">
            <label>بر اساس ملک</label>
            <select value={mode === "property" ? propertyId : ""}
              onChange={(e) => setParams(e.target.value ? { propertyId: e.target.value } : {})}>
              <option value="">انتخاب کنید</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title} — {p.city}</option>
              ))}
            </select>
            <div className="form-hint">خریداران متناسب با این فایل نمایش داده می‌شود.</div>
          </div>
        </div>
      </div>

      {loading && <div className="skeleton" style={{ height: 160, borderRadius: 18 }} />}

      {!loading && !result && (
        <div className="empty">
          <div className="empty-title">یک مبنا انتخاب کنید</div>
          <p>برای مشاهده نتایج، یک درخواست خریدار یا یک ملک را از فهرست بالا انتخاب کنید.</p>
          <Link to="/requests" className="btn btn-primary">مشاهده درخواست‌ها</Link>
        </div>
      )}

      {!loading && result && (
        <section>
          <div className="section-header">
            <h2 className="subtitle">
              {mode === "request"
                ? `املاک متناسب با درخواست ${result.buyer_request?.buyer_name || ""}`
                : `خریداران متناسب با ${result.property?.title || ""}`}
            </h2>
            <span className="muted num">{matches.length} نتیجه</span>
          </div>

          {matches.length === 0 ? (
            <div className="empty">
              <div className="empty-title">تطابقی یافت نشد</div>
              <p>موردی با نوع معامله یکسان وجود ندارد. ابتدا داده بیشتری ثبت کنید.</p>
              <Link to={mode === "request" ? "/properties/new" : "/requests/new"} className="btn btn-primary">
                {mode === "request" ? "ثبت ملک" : "ثبت درخواست"}
              </Link>
            </div>
          ) : (
            <div className="stack" style={{ gap: 16 }}>
              {matches.map((m, i) => {
                const t = mode === "request" ? m.property : m.buyer_request;
                return (
                  <article className="card match-card" key={i}>
                    <div className="match-card-head">
                      <div>
                        <h3 className="card-title" style={{ marginBottom: 6 }}>
                          {mode === "request"
                            ? <Link to={`/properties/${t.id}`}>{t.title}</Link>
                            : `${typeLabel(t.property_type)} — ${t.buyer_name}`}
                        </h3>
                        <div className="meta-row">
                          <span>{transactionLabel(t.transaction_type)}</span>
                          <span className="sep">·</span>
                          <span>{t.city}{t.district ? `، ${t.district}` : ""}</span>
                          <span className="sep">·</span>
                          <span>
                            {mode === "request"
                              ? `${t.area} متر، ${t.transaction_type === "RENT" ? formatPrice(t.deposit) : formatPrice(t.price)}`
                              : `${formatPrice(t.min_price)} تا ${formatPrice(t.max_price)}`}
                          </span>
                        </div>
                      </div>
                      <span className={`score-badge lg ${scoreClass(m.score)}`}>{m.score}%</span>
                    </div>
                    <ScoreBars m={m} />
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {saved !== null && (
        <section style={{ marginTop: 48 }}>
          <div className="section-header">
            <h2 className="subtitle">تطابق‌های ذخیره‌شده</h2>
            <span className="muted num">{saved.length} مورد</span>
          </div>
          {saved.length === 0 ? (
            <div className="empty">
              <div className="empty-title">چیزی ذخیره نشده</div>
              <p>با اجرای موتور، تطابق‌های با امتیاز بالای ۲۰ درصد در دیتابیس ذخیره می‌شوند.</p>
              <button className="btn btn-primary" onClick={runEngine}>اجرای موتور</button>
            </div>
          ) : (
            <div className="card">
              {saved.map((s) => (
                <div className="list-row" key={s.id}>
                  <div>
                    <div className="list-row-title">{s.property?.title || `ملک ${s.property_id}`}</div>
                    <div className="meta-row">
                      <span>درخواست {s.buyer_request_id}</span>
                      {s.buyer_request?.buyer_name && (
                        <>
                          <span className="sep">·</span>
                          <span>{s.buyer_request.buyer_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`score-badge ${scoreClass(s.score)}`}>{s.score}%</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
