from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models.buyer_request import BuyerRequest, BuyerRequestFeature

buyer_request_bp = Blueprint("buyer_requests", __name__, url_prefix="/api/buyer-requests")

@buyer_request_bp.get("")
def list_buyer_requests():
    query = BuyerRequest.query

    status = request.args.get("status")
    if status and status != "all":
        query = query.filter_by(status=status)
    elif not status:
        query = query.filter_by(status="OPEN")

    city = request.args.get("city")
    if city:
        query = query.filter(BuyerRequest.city.ilike(f"%{city.strip()}%"))

    district = request.args.get("district")
    if district:
        query = query.filter(BuyerRequest.district.ilike(f"%{district.strip()}%"))

    property_type = request.args.get("property_type")
    if property_type:
        query = query.filter_by(property_type=property_type)

    transaction_type = request.args.get("transaction_type")
    if transaction_type:
        query = query.filter_by(transaction_type=transaction_type)

    buyer_id = request.args.get("buyer_id", type=int)
    if buyer_id:
        query = query.filter_by(buyer_id=buyer_id)

    requests = query.order_by(BuyerRequest.created_at.desc()).all()
    return jsonify({"buyer_requests": [r.to_dict() for r in requests]})

@buyer_request_bp.get("/<int:request_id>")
def get_buyer_request(request_id):
    obj = BuyerRequest.query.get(request_id)
    if not obj:
        return jsonify({"message": "درخواست خرید یافت نشد"}), 404
    return jsonify({"buyer_request": obj.to_dict()})

@buyer_request_bp.post("")
@jwt_required()
def create_buyer_request():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    for field in ["property_type", "city"]:
        if not data.get(field):
            return jsonify({"message": f"فیلد {field} الزامی است"}), 400

    obj = BuyerRequest(
        buyer_id=current_user_id,
        property_type=data["property_type"],
        transaction_type=data.get("transaction_type", "SALE"),
        province=data.get("province"),
        city=data["city"],
        district=data.get("district"),
        min_area=int(data["min_area"]) if data.get("min_area") is not None and data.get("min_area") != "" else None,
        max_area=int(data["max_area"]) if data.get("max_area") is not None and data.get("max_area") != "" else None,
        bedrooms=int(data["bedrooms"]) if data.get("bedrooms") is not None and data.get("bedrooms") != "" else None,
        min_price=int(data["min_price"]) if data.get("min_price") is not None and data.get("min_price") != "" else None,
        max_price=int(data["max_price"]) if data.get("max_price") is not None and data.get("max_price") != "" else None,
        description=data.get("description"),
        status="OPEN"
    )
    db.session.add(obj)
    db.session.flush()

    for feature in data.get("features", []):
        if feature and feature.strip():
            db.session.add(BuyerRequestFeature(buyer_request_id=obj.id, feature=feature.strip()))

    db.session.commit()
    return jsonify({
        "message": "درخواست خرید با موفقیت ثبت شد",
        "buyer_request": obj.to_dict()
    }), 201

@buyer_request_bp.put("/<int:request_id>")
@jwt_required()
def update_buyer_request(request_id):
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get("role") == "ADMIN"

    obj = BuyerRequest.query.get(request_id)
    if not obj:
        return jsonify({"message": "درخواست خرید یافت نشد"}), 404

    if obj.buyer_id != current_user_id and not is_admin:
        return jsonify({"message": "دسترسی غیرمجاز"}), 403

    data = request.get_json() or {}

    for field in ["property_type", "transaction_type", "province", "city", "district", "description", "status"]:
        if field in data:
            setattr(obj, field, data[field])

    for field in ["min_area", "max_area", "bedrooms", "min_price", "max_price"]:
        if field in data:
            val = data[field]
            setattr(obj, field, int(val) if val is not None and val != "" else None)

    if "features" in data:
        BuyerRequestFeature.query.filter_by(buyer_request_id=obj.id).delete()
        for feature in data["features"]:
            if feature and feature.strip():
                db.session.add(BuyerRequestFeature(buyer_request_id=obj.id, feature=feature.strip()))

    db.session.commit()
    return jsonify({
        "message": "درخواست با موفقیت ویرایش شد",
        "buyer_request": obj.to_dict()
    })

@buyer_request_bp.delete("/<int:request_id>")
@jwt_required()
def delete_buyer_request(request_id):
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get("role") == "ADMIN"

    obj = BuyerRequest.query.get(request_id)
    if not obj:
        return jsonify({"message": "درخواست خرید یافت نشد"}), 404

    if obj.buyer_id != current_user_id and not is_admin:
        return jsonify({"message": "شما اجازه حذف این درخواست را ندارید"}), 403

    db.session.delete(obj)
    db.session.commit()
    return jsonify({"message": "درخواست خرید با موفقیت حذف شد"})
