export default function PropertyLocation({latitude,longitude}) {
  return <div dir="rtl"><h3>📍 موقعیت ملک</h3><p>Latitude: {latitude ?? "-"}</p><p>Longitude: {longitude ?? "-"}</p></div>;
}
