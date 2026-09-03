import React from "react";
import { Link } from "react-router-dom";
import { typeLabel, transactionLabel, formatPrice, scoreClass } from "../../utils/format";

export default function PropertyCard({ property, score }) {
  if (!property) return null;
  const p = property;
  return (
    <div className="property-card" dir="rtl">
      <div className="property-card-media">
        {p.primary_image ? (
          <img src={p.primary_image} alt={p.title} />
        ) : (
          <span className="placeholder">🏢</span>
        )}
        <span className={`badge ${p.transaction_type === "RENT" ? "badge-rent" : "badge-sale"}`}>
          {transactionLabel(p.transaction_type)}
        </span>
        {score !== undefined && score !== null && (
          <span className={`score-badge ${scoreClass(score)}`}>{score}%</span>
        )}
      </div>

      <div className="property-card-body">
        <h3 className="property-card-title">
          <Link to={`/properties/${p.id}`}>{p.title}</Link>
        </h3>
        <div className="meta-row">
          <span>📍 {p.city}{p.district ? ` - ${p.district}` : ""}</span>
          <span>🏷️ {typeLabel(p.property_type)}</span>
        </div>
        <div className="meta-row">
          <span>📐 {p.area} متر</span>
          <span>🛏️ {p.bedrooms ?? "-"} خواب</span>
          {p.build_year ? <span>🗓️ {p.build_year}</span> : null}
        </div>
        <div className="property-card-price">
          {p.transaction_type === "RENT"
            ? `ودیعه ${formatPrice(p.deposit)} / اجاره ${formatPrice(p.rent)}`
            : formatPrice(p.price)}
        </div>
        {p.features?.length > 0 && (
          <div className="chip-row">
            {p.features.slice(0, 4).map((f) => (
              <span className="chip" key={f}>{f}</span>
            ))}
          </div>
        )}
        <div className="property-card-actions">
          <Link to={`/properties/${p.id}`} className="btn btn-outline btn-sm">جزئیات</Link>
          <Link to={`/matching?propertyId=${p.id}`} className="btn btn-primary btn-sm">تطابق ⚡</Link>
        </div>
      </div>
    </div>
  );
}
