export default function StatCard({title,value,icon}) {
  return <div dir="rtl" className="stat-card"><span>{icon}</span><small>{title}</small><strong>{value}</strong></div>;
}
