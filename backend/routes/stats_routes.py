from flask import Blueprint, jsonify
from models.property import Property
from models.buyer_request import BuyerRequest
from models.matching_result import MatchingResult
from models.user import User

stats_bp = Blueprint("stats", __name__, url_prefix="/api/stats")

@stats_bp.get("")
def get_stats():
    active_properties = Property.query.filter_by(status="ACTIVE").count()
    total_properties = Property.query.count()
    open_requests = BuyerRequest.query.filter_by(status="OPEN").count()
    total_requests = BuyerRequest.query.count()
    total_users = User.query.count()
    matches_count = MatchingResult.query.count()
    high_matches_count = MatchingResult.query.filter(MatchingResult.score >= 70.0).count()

    recent_properties = [p.to_dict() for p in Property.query.order_by(Property.created_at.desc()).limit(5).all()]
    recent_requests = [r.to_dict() for r in BuyerRequest.query.order_by(BuyerRequest.created_at.desc()).limit(5).all()]

    return jsonify({
        "active_properties": active_properties,
        "total_properties": total_properties,
        "open_requests": open_requests,
        "total_requests": total_requests,
        "total_users": total_users,
        "matches_count": matches_count,
        "high_matches_count": high_matches_count,
        "recent_properties": recent_properties,
        "recent_requests": recent_requests
    })
