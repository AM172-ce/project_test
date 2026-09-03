import React from "react";

export default function PropertyLocation({ latitude, longitude, address, city, district }) {
  const hasCoords = latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined;
  const mapUrl = hasCoords ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}` : null;

  return (
    <div dir="rtl" className="card" style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          📍 موقعیت جغرافیایی ملک
        </h3>
        {hasCoords && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            🗺️ مشاهده در نقشه آنلاین
          </a>
        )}
      </div>

      {address && (
        <p style={{ fontSize: 14, color: "var(--text-main)", marginBottom: 10 }}>
          <strong>آدرس:</strong> {city ? `${city}، ` : ""}{district ? `${district}، ` : ""}{address}
        </p>
      )}

      <div style={{ display: "flex", gap: 16, background: "#f8fafc", padding: 12, borderRadius: 8, fontSize: 13 }}>
        <div>
          <span style={{ color: "var(--text-muted)" }}>عرض جغرافیایی (Latitude): </span>
          <strong>{latitude ? Number(latitude).toFixed(4) : "-"}</strong>
        </div>
        <div>
          <span style={{ color: "var(--text-muted)" }}>طول جغرافیایی (Longitude): </span>
          <strong>{longitude ? Number(longitude).toFixed(4) : "-"}</strong>
        </div>
      </div>

      {hasCoords ? (
        <div style={{
          marginTop: 12,
          height: 140,
          background: "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)",
          borderRadius: 8,
          border: "1px dashed #93c5fd",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#1e40af",
          gap: 6
        }}>
          <span style={{ fontSize: 32 }}>📍</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>مختصات ثبت‌شده: {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}</span>
          <small style={{ fontSize: 11, color: "#3b82f6" }}>برای مشاهده نقشه تعاملی روی دکمه «مشاهده در نقشه آنلاین» کلیک کنید</small>
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>مختصات جغرافیایی برای این ملک ثبت نشده است.</p>
      )}
    </div>
  );
}
