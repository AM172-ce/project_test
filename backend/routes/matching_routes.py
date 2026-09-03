from flask import Blueprint, request, jsonify
from extensions import db
from models.property import Property, PropertyFeature
from models.buyer_request import BuyerRequest, BuyerRequestFeature
from models.matching_result import MatchingResult
from matching.engine import calculate_match

matching_bp = Blueprint("matching", __name__, url_prefix="/api/matches")

@matching_bp.get("/request/<int:request_id>")
def match_for_request(request_id):
    req = BuyerRequest.query.get(request_id)
    if not req:
        return jsonify({"message": "درخواست خرید یافت نشد"}), 404

    r_features = [f.feature for f in req.features]
    properties = Property.query.filter_by(status="ACTIVE").all()

    matches = []
    for prop in properties:
        # Filter by same transaction type if available
        if req.transaction_type and prop.transaction_type and req.transaction_type != prop.transaction_type:
            continue
        p_features = [f.feature for f in prop.features]
        result = calculate_match(prop, req, p_features, r_features)
        matches.append({
            "property": prop.to_dict(),
            "score": result["score"],
            "price_score": result["price"],
            "location_score": result["location"],
            "area_score": result["area"],
            "bedroom_score": result["bedroom"],
            "type_score": result["type"],
            "feature_score": result["features"],
            "build_year_score": result["build_year"]
        })

    matches.sort(key=lambda m: m["score"], reverse=True)
    return jsonify({
        "buyer_request": req.to_dict(),
        "total_properties": len(properties),
        "matches": matches
    })

@matching_bp.get("/property/<int:property_id>")
def match_for_property(property_id):
    prop = Property.query.get(property_id)
    if not prop:
        return jsonify({"message": "ملک یافت نشد"}), 404

    p_features = [f.feature for f in prop.features]
    requests = BuyerRequest.query.filter_by(status="OPEN").all()

    matches = []
    for req in requests:
        if prop.transaction_type and req.transaction_type and prop.transaction_type != req.transaction_type:
            continue
        r_features = [f.feature for f in req.features]
        result = calculate_match(prop, req, p_features, r_features)
        matches.append({
            "buyer_request": req.to_dict(),
            "score": result["score"],
            "price_score": result["price"],
            "location_score": result["location"],
            "area_score": result["area"],
            "bedroom_score": result["bedroom"],
            "type_score": result["type"],
            "feature_score": result["features"],
            "build_year_score": result["build_year"]
        })

    matches.sort(key=lambda m: m["score"], reverse=True)
    return jsonify({
        "property": prop.to_dict(),
        "total_requests": len(requests),
        "matches": matches
    })

@matching_bp.post("/run")
def run_matching_engine():
    """Runs match algorithm across all open requests and active properties, saving high scores to database."""
    requests = BuyerRequest.query.filter_by(status="OPEN").all()
    properties = Property.query.filter_by(status="ACTIVE").all()

    # Clear previous matching results to refresh
    MatchingResult.query.delete()

    created_count = 0
    for req in requests:
        r_features = [f.feature for f in req.features]
        for prop in properties:
            if req.transaction_type and prop.transaction_type and req.transaction_type != prop.transaction_type:
                continue
            p_features = [f.feature for f in prop.features]
            res = calculate_match(prop, req, p_features, r_features)

            # Store matches with score >= 20%
            if res["score"] >= 20.0:
                mr = MatchingResult(
                    buyer_request_id=req.id,
                    property_id=prop.id,
                    score=res["score"],
                    price_score=res["price"],
                    location_score=res["location"],
                    area_score=res["area"],
                    bedroom_score=res["bedroom"],
                    type_score=res["type"],
                    feature_score=res["features"]
                )
                db.session.add(mr)
                created_count += 1

    db.session.commit()
    return jsonify({
        "message": f"موتور تطابق با موفقیت اجرا شد. {created_count} تطابق ثبت گردید.",
        "matches_count": created_count
    })

@matching_bp.get("/saved")
def get_saved_matches():
    results = MatchingResult.query.order_by(MatchingResult.score.desc()).limit(100).all()
    return jsonify({"matches": [r.to_dict() for r in results]})
