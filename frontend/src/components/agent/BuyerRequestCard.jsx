import React from "react";
import { Link } from "react-router-dom";

const TYPE_TRANSLATIONS = {
  APARTMENT: "آپارتمان",
  VILLA: "ویلا",
  OFFICE: "اداری",
  COMMERCIAL: "تجاری",
  LAND: "زمین",
};

export default function BuyerRequestCard({ request, onMatchClick }) {
  if (!request) return null;
  const score = request.match_score ?? request.score;
  const typeFa = TYPE_TRANSLATIONS[request.property_type] || request.property_type;

  const getScoreClass = (s) => {
    if (s >= 75) return "high";
    if (s >= 40) return "mid";
    return "low";
  };

  const formatPrice = (val) => {
    if (!val) return "نامشخص";
    if (val >= 1000000000) return `${(val / 1000000000).toLocaleString("fa-IR")} میلیارد تومان`;
    if (val >= 1000000) return `${(val / 1000000).toLocaleString("fa-IR")} میلیون تومان`;
    return `${val.toLocaleString("fa-IR")} تومان`;
  };

  return (
    <div dir="rtl" className="request-card">
      <div className="request-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🎯</span>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{typeFa}</h3>
          <span className={`badge ${request.transaction_type === "RENT" ? "badge-rent" : "badge-sale"}`}>
            {request.transaction_type === "RENT" ? "رهن و اجاره" : "خرید"}
          </span>
        </div>

        {score !== undefined && score !== null && (
          <span className={`match-score-badge ${getScoreClass(score)}`}>
            ⚡ {Math.round(score)}% تطابق
          </span>
        )}
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
        📍 {request.city} {request.district ? `- ${request.district}` : ""}
      </p>

      <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4, color: "var(--text-main)" }}>
        {(request.min_price || request.max_price) && (
          <div>
            💰 <strong>بودجه:</strong> {request.min_price ? `از ${formatPrice(request.min_price)}` : ""} {request.max_price ? `تا ${formatPrice(request.max_price)}` : ""}
          </div>
        )}
        {(request.min_area || request.max_area) && (
          <div>
            📐 <strong>متراژ:</strong> {request.min_area || "-"} تا {request.max_area || "-"} متر
          </div>
        )}
        {request.bedrooms && (
          <div>
            🛏️ <strong>تعداد خواب:</strong> {request.bedrooms} خوابه
          </div>
        )}
      </div>

      {request.features && request.features.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
          {request.features.map((f, i) => (
            <span key={i} className="feature-tag">{f}</span>
          ))}
        </div>
      )}

      {request.description && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", background: "#f8fafc", padding: 8, borderRadius: 6 }}>
          {request.description}
        </p>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border-color)" }}>
        <small style={{ color: "var(--text-light)" }}>
          {request.buyer_name ? `متقاضی: ${request.buyer_name}` : ""}
        </small>
        <div style={{ display: "flex", gap: 6 }}>
          {onMatchClick ? (
            <button className="btn btn-primary btn-sm" onClick={() => onMatchClick(request)}>
              ⚡ مشاهده املاک منطبق
            </button>
          ) : (
            <Link to={`/matching?requestId=${request.id}`} className="btn btn-primary btn-sm">
              ⚡ مشاهده املاک منطبق
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
