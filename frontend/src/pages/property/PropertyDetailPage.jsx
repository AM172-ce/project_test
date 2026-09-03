import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import PropertyImageUploader from "../../components/property/PropertyImageUploader";
import PropertyLocation from "../../components/property/PropertyLocation";
import { typeLabel, transactionLabel, formatPrice, featureLabel, apiError, scoreClass } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [p, setP] = useState(null);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/properties/${id}`);
      setP(res.data.property);
    } catch (e) { setError(apiError(e, "ملک یافت نشد")); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const loadMatches = async () => {
    try {
      const res = await api.get(`/matches/property/${id}`);
      setMatches(res.data.matches || []);
    } catch (e) { setError(apiError(e)); }
  };

  const remove = async () => {
    if (!confirm("این ملک حذف شود؟")) return;
    try {
      await api.delete(`/properties/${id}`);
      navigate("/properties");
    } catch (e) { setError(apiError(e, "خطا در حذف")); }
  };

  const deleteImage = async (imgId) => {
    try { await api.delete(`/properties/${id}/images/${imgId}`); load(); }
    catch (e) { setError(apiError(e)); }
  };

  if (loading) return <p className="muted" dir="rtl">در حال بارگذاری...</p>;
  if (!p) return <div className="alert alert-danger" dir="rtl">{error || "ملک یافت نشد"}</div>;

  return (
    <div dir="rtl">
      <div className="section-header">
        <div>
          <h1 className="section-title">{p.title}</h1>
          <p className="section-desc">
            <span className={`badge ${p.transaction_type === "RENT" ? "badge-rent" : "badge-sale"}`}>
              {transactionLabel(p.transaction_type)}
            </span>{" "}
            {typeLabel(p.property_type)} • {p.city}{p.district ? ` - ${p.district}` : ""} • کد {p.id}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link to={`/properties/${id}/edit`} className="btn btn-outline">✏️ ویرایش</Link>
          <button className="btn btn-outline" style={{ color: "var(--danger)" }} onClick={remove}>🗑 حذف</button>
          <Link to={`/matching?propertyId=${id}`} className="btn btn-primary">⚡ تطابق با خریداران</Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>📋 مشخصات</h3>
          <table className="detail-table">
            <tbody>
              <tr><td>قیمت</td><td>{p.transaction_type === "RENT" ? `ودیعه ${formatPrice(p.deposit)} / اجاره ${formatPrice(p.rent)}` : formatPrice(p.price)}</td></tr>
              <tr><td>متراژ</td><td>{p.area} متر</td></tr>
              <tr><td>اتاق خواب</td><td>{p.bedrooms ?? "-"}</td></tr>
              <tr><td>طبقه</td><td>{p.floor ?? "-"} از {p.total_floors ?? "-"}</td></tr>
              <tr><td>سال ساخت</td><td>{p.build_year ?? "-"}</td></tr>
              <tr><td>وضعیت</td><td>{p.status}</td></tr>
              <tr><td>مشاور</td><td>{p.agent_name || "-"} {p.agent_mobile ? `(${p.agent_mobile})` : ""}</td></tr>
              <tr><td>امکانات</td><td>{p.features?.length ? p.features.map(featureLabel).join("، ") : "-"}</td></tr>
            </tbody>
          </table>
          {p.description && <p style={{ marginTop: 12, lineHeight: 1.9 }}>{p.description}</p>}
        </div>

        <div>
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>🖼 تصاویر ({p.images?.length || 0})</h3>
            {p.images?.length ? (
              <div className="image-grid">
                {p.images.map((img) => (
                  <div className="image-tile" key={img.id}>
                    <img src={img.image_url} alt="" />
                    {img.is_primary && <span className="badge badge-sale">اصلی</span>}
                    <button className="btn btn-sm btn-outline" onClick={() => deleteImage(img.id)}>حذف</button>
                  </div>
                ))}
              </div>
            ) : <p className="muted">تصویری ثبت نشده است.</p>}
          </div>

          {isAuthenticated
            ? <PropertyImageUploader propertyId={p.id} onUploadSuccess={load} />
            : <div className="alert alert-warning">برای آپلود تصویر وارد شوید.</div>}

          <PropertyLocation
            latitude={p.latitude} longitude={p.longitude}
            address={p.address} city={p.city} district={p.district}
          />
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <h3>⚡ خریداران متناسب با این ملک</h3>
          <button className="btn btn-primary btn-sm" onClick={loadMatches}>محاسبه تطابق</button>
        </div>
        {matches.length === 0 ? <p className="muted">برای محاسبه، دکمه بالا را بزنید.</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {matches.map((m, i) => (
              <div key={i} className="match-row">
                <div>
                  <strong>{typeLabel(m.buyer_request.property_type)}</strong> — {m.buyer_request.city}
                  {m.buyer_request.district ? ` / ${m.buyer_request.district}` : ""} •{" "}
                  {m.buyer_request.buyer_name}
                  <div className="muted" style={{ fontSize: 12 }}>
                    بودجه: {formatPrice(m.buyer_request.min_price)} تا {formatPrice(m.buyer_request.max_price)}
                  </div>
                </div>
                <span className={`score-badge ${scoreClass(m.score)}`}>{m.score}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
