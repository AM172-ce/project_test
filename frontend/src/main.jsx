import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return <main dir="rtl" style={{padding:40,fontFamily:"sans-serif"}}>
    <h1>🏠 خانه من</h1>
    <p>نسخه 0.2 پروژه با PostgreSQL آماده است.</p>
  </main>;
}
createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);
