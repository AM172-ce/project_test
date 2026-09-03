import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import PropertyImageUploader from "../../components/property/PropertyImageUploader";
import PropertyLocation from "../../components/property/PropertyLocation";
import { useAuth } from "../../context/AuthContext";
import {
  typeLabel, transactionLabel, formatPrice, featureLabel, apiError, scoreClass,
} from "../../utils/format";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [p, setP] = useState(null);
  const [matches, setMatches] = useState(null);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/properties/${id}`);
      setP(res.data.property);
    } catch (e) {
      setError(apiError(e, "ملک یافت نشد"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const loadMatches = async () => {
    setLoadingMatches(true);
    try {
      const res = await api.get(`/matches/property/${id}`);
      setMatches(res.data.matches || []);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoadingMatches(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("این ملک برای همیشه حذف می‌شود. ادامه می‌دهید؟")) return;
    try {
      await api.delete(`/properties/${id}`);
      navigate("/properties");
    } catch (e) {
      setError(apiError(e, "خطا در حذف ملک"));
    }
  };

  const deleteImage = async (imgId) => {
    try {
      await api.delete(`/properties/${id}/images/${imgId}`);
      load();
    } catch (e) {
      setError(apiError(e));
    }
  };

  if (loading) {
    return (
      <div className="stack">
        <div className="skeleton" style={{ height: 40, width: "50%" }} />
        <div className="skeleton skeleton-card" />
      </div>
    );
  }

  if (!p) return <div className="alert alert-critical">{error || "ملک یافت نشد"}</div>;

  return (
    <div>
      <header className="page-header">
        <div>
          <div className="meta-row" style={{ marginBottom: 8 }}>
            <span className="badge">{transactionLabel(p.transaction_type)}</span>
            <span className="badge">{typeLabel(p.property_type)}</span>
            <span className="badge">کد {p.id}</span>
          </div>
          <h1 className="title">{p.title}</h1>
          <p className="lead">{[p.city, p.district].filter(Boolean).join("، ")}</p>
        </div>
        <div className="row">
          <Link to={`/properties/${id}/edit`} className="btn btn-outline">ویرایش</Link>
          <button className="btn btn-critical" onClick={remove}>حذف</button>
          <Link to={`/matching?propertyId=${id}`} className="btn btn-primary">تطابق</Link>
        </div>
      </header>

      {error && <div className="alert alert-critical">{error}</div>}

      <div className="grid-2">
        <section>
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 14 }}>مشخصات</h2>
            <dl className="spec-list">
              <dt>قیمت</dt>
              <dd>
                {p.transaction_type === "RENT"
                  ? `${formatPrice(p.deposit)} ودیعه، ${formatPrice(p.rent)} اجاره`
                  : formatPrice(p.price)}
              </dd>
              <dt>متراژ</dt><dd>{p.area} متر</dd>
              <dt>اتاق خواب</dt><dd>{p.bedrooms ?? "—"}</dd>
              <dt>طبقه</dt><dd>{p.floor ?? "—"} از {p.total_floors ?? "—"}</dd>
              <dt>سال ساخت</dt><dd>{p.build_year ?? "—"}</dd>
              <dt>وضعیت</dt><dd>{p.status}</dd>
              <dt>مشاور</dt><dd>{p.agent_name || "—"}</dd>
            </dl>

            {p.features?.length > 0 && (
              <div className="chip-row" style={{ marginTop: 18 }}>
                {p.features.map((f) => <span className="chip" key={f}>{featureLabel(f)}</span>)}
              </div>
            )}

            {p.description && (
              <p className="card-body" style={{ marginTop: 18 }}>{p.description}</p>
            )}
          </div>
        </section>

        <section>
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 14 }}>
              تصاویر <span className="muted num">({p.images?.length || 0})</span>
            </h2>
            {p.images?.length ? (
              <div className="image-grid">
                {p.images.map((img) => (
                  <div className="image-tile" key={img.id}>
                    <img src={img.image_url} alt="" loading="lazy" />
                    <div className="image-tile-bar">
                      {img.is_primary ? <span className="badge">اصلی</span> : <span />}
                      <button className="btn btn-quiet btn-sm" onClick={() => deleteImage(img.id)}>
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">تصویری ثبت نشده است.</p>
            )}
          </div>

          {isAuthenticated ? (
            <PropertyImageUploader propertyId={p.id} onUploadSuccess={load} />
          ) : (
            <div className="alert alert-caution" style={{ marginTop: 20 }}>
              برای افزودن تصویر باید <Link to="/login">وارد شوید</Link>.
            </div>
          )}

          <PropertyLocation
            latitude={p.latitude} longitude={p.longitude}
            address={p.address} city={p.city} district={p.district}
          />
        </section>
      </div>

      <section style={{ marginTop: 48 }}>
        <div className="section-header">
          <h2 className="subtitle">خریداران متناسب</h2>
          <button className="btn btn-outline btn-sm" onClick={loadMatches} disabled={loadingMatches}>
            {loadingMatches ? "در حال محاسبه" : "محاسبه تطابق"}
          </button>
        </div>

        {matches === null ? (
          <div className="card card-quiet">
            <p className="muted">
              برای مقایسه این ملک با تقاضاهای باز، دکمه «محاسبه تطابق» را بزنید.
            </p>
          </div>
        ) : matches.length === 0 ? (
          <div className="empty">
            <div className="empty-title">تطابقی یافت نشد</div>
            <p>هیچ درخواست بازی با نوع معامله این ملک هم‌خوانی ندارد.</p>
            <Link to="/requests/new" className="btn btn-primary">ثبت درخواست</Link>
          </div>
        ) : (
          <div className="card">
            {matches.map((m, i) => (
              <div className="list-row" key={i}>
                <div>
                  <div className="list-row-title">
                    {typeLabel(m.buyer_request.property_type)} — {m.buyer_request.city}
                    {m.buyer_request.district ? `، ${m.buyer_request.district}` : ""}
                  </div>
                  <div className="meta-row">
                    <span>{m.buyer_request.buyer_name}</span>
                    <span className="sep">·</span>
                    <span>{formatPrice(m.buyer_request.min_price)} تا {formatPrice(m.buyer_request.max_price)}</span>
                  </div>
                </div>
                <span className={`score-badge ${scoreClass(m.score)}`}>{m.score}%</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
