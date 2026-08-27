import StatCard from "../../components/agent/StatCard";
export default function AgentDashboard() {
  return <main dir="rtl" style={{padding:40}}><h1>📊 داشبورد مشاور</h1><div style={{display:"grid",gap:16,gridTemplateColumns:"repeat(4,minmax(0,1fr))"}}>
    <StatCard title="املاک فعال" value="1" icon="🏠"/><StatCard title="درخواست‌های جدید" value="0" icon="🎯"/><StatCard title="پیشنهادها" value="0" icon="📨"/><StatCard title="گفتگوها" value="0" icon="💬"/>
  </div></main>;
}
