import React from "react";
import { Link } from "react-router-dom";
import { typeLabel, transactionLabel, formatPrice, scoreClass } from "../../utils/format";

export default function PropertyCard({ property, score }) {
  if (!property) return null;
  const p = property;

  return (
    <article className="property-card">
      <div className="property-media">
        {p.primary_image ? (
          <img src={p.primary_image} alt={p.title} loading="lazy" />
        ) : (
          <span className="property-media-empty">بدون تصویر</span>
        )}
        <span className="badge">{transactionLabel(p.transaction_type)}</span>
        {score !== undefined && score !== null && (
          <span className={`score-badge ${scoreClass(score)}`}>{score}%</span>
        )}
      </div>

      <div className="property-body">
        <h3 className="property-title">
          <Link to={`/properties/${p.id}`}>{p.title}</Link>
        </h3>

        <div className="meta-row">
          <span>{p.city}{p.district ? `، ${p.district}` : ""}</span>
          <span className="sep">·</span>
          <span>{typeLabel(p.property_type)}</span>
        </div>

        <div className="meta-row">
          <span>{p.area} متر</span>
          <span className="sep">·</span>
          <span>{p.bedrooms ?? "—"} خواب</span>
          {p.build_year ? (
            <>
              <span className="sep">·</span>
              <span>ساخت {p.build_year}</span>
            </>
          ) : null}
        </div>

        <div className="property-price">
          {p.transaction_type === "RENT"
            ? `${formatPrice(p.deposit)} ودیعه`
            : formatPrice(p.price)}
        </div>

        <div className="property-actions">
          <Link to={`/properties/${p.id}`} className="btn btn-outline btn-sm">جزئیات</Link>
          <Link to={`/matching?propertyId=${p.id}`} className="btn btn-secondary btn-sm">تطابق</Link>
        </div>
      </div>
    </article>
  );
}
