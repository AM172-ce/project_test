import React from "react";

export default function StatCard({ title, value, icon }) {
  return (
    <div dir="rtl" className="stat-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>{icon}</span>
      </div>
      <small>{title}</small>
      <strong>{value ?? 0}</strong>
    </div>
  );
}
