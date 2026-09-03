import React from "react";

export default function PropertyLocation({ latitude, longitude, address, city, district }) {
  const hasCoords =
    latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined;
  const mapUrl = hasCoords
    ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`
    : null;

  return (
    <section className="card" style={{ marginTop: 20 }}>
      <div className="section-header">
        <h3 className="card-title" style={{ marginBottom: 0 }}>موقعیت</h3>
        {hasCoords && (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            نمایش روی نقشه
          </a>
        )}
      </div>

      {address && (
        <p className="card-body" style={{ marginBottom: 14 }}>
          {[city, district, address].filter(Boolean).join("، ")}
        </p>
      )}

      {hasCoords ? (
        <div className="map-frame">
          <span>{Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}</span>
          <span className="muted" style={{ fontSize: 12 }}>مختصات ثبت‌شده</span>
        </div>
      ) : (
        <p className="muted">مختصات جغرافیایی برای این ملک ثبت نشده است.</p>
      )}
    </section>
  );
}
