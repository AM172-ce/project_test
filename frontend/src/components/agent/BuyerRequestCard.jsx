import React from "react";
import { Link } from "react-router-dom";
import { typeLabel, transactionLabel, formatPrice, featureLabel, scoreClass } from "../../utils/format";

export default function BuyerRequestCard({ request }) {
  if (!request) return null;
  const r = request;
  const score = r.match_score ?? r.score;

  const budget =
    r.min_price || r.max_price
      ? `${formatPrice(r.min_price)} تا ${formatPrice(r.max_price)}`
      : "نامشخص";

  const area =
    r.min_area || r.max_area ? `${r.min_area ?? "—"} تا ${r.max_area ?? "—"} متر` : "نامشخص";

  return (
    <article className="request-card">
      <div className="request-card-head">
        <div>
          <h3 className="card-title" style={{ marginBottom: 4 }}>
            {typeLabel(r.property_type)} — {r.city}{r.district ? `، ${r.district}` : ""}
          </h3>
          <div className="meta-row">
            <span className="badge">{transactionLabel(r.transaction_type)}</span>
            {r.buyer_name && (
              <>
                <span className="sep">·</span>
                <span>{r.buyer_name}</span>
              </>
            )}
          </div>
        </div>
        {score !== undefined && score !== null && (
          <span className={`score-badge ${scoreClass(score)}`}>{score}%</span>
        )}
      </div>

      <dl className="spec-list">
        <dt>بودجه</dt>
        <dd>{budget}</dd>
        <dt>متراژ</dt>
        <dd>{area}</dd>
        <dt>اتاق خواب</dt>
        <dd>{r.bedrooms ?? "—"}</dd>
      </dl>

      {r.features?.length > 0 && (
        <div className="chip-row">
          {r.features.map((f) => (
            <span className="chip" key={f}>{featureLabel(f)}</span>
          ))}
        </div>
      )}

      {r.description && <p className="card-body">{r.description}</p>}

      <div>
        <Link to={`/matching?requestId=${r.id}`} className="btn btn-outline btn-sm">
          مشاهده املاک متناسب
        </Link>
      </div>
    </article>
  );
}
