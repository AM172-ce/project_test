export default function BuyerRequestCard({request}) {
  return <div dir="rtl"><h3>{request.property_type}</h3><p>{request.city} - {request.district}</p><strong>Match: {request.match_score}%</strong></div>;
}
