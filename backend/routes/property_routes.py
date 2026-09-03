import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models.property import Property, PropertyImage, PropertyFeature
from models.user import User
from schemas.property import PropertyCreateSchema
from services.property_service import create_property, update_property

property_bp = Blueprint("properties", __name__, url_prefix="/api/properties")
ALLOWED = {"jpg", "jpeg", "png", "webp"}

@property_bp.get("")
def list_properties():
    query = Property.query

    # Status filter - default to ACTIVE unless explicitly requested otherwise
    status = request.args.get("status")
    if status and status != "all":
        query = query.filter_by(status=status)
    elif not status:
        query = query.filter_by(status="ACTIVE")

    # City filter
    city = request.args.get("city")
    if city:
        query = query.filter(Property.city.ilike(f"%{city.strip()}%"))

    # District filter
    district = request.args.get("district")
    if district:
        query = query.filter(Property.district.ilike(f"%{district.strip()}%"))

    # Property type filter
    property_type = request.args.get("property_type")
    if property_type:
        query = query.filter_by(property_type=property_type)

    # Transaction type filter
    transaction_type = request.args.get("transaction_type")
    if transaction_type:
        query = query.filter_by(transaction_type=transaction_type)

    # Price filters
    min_price = request.args.get("min_price", type=int)
    if min_price is not None:
        query = query.filter(Property.price >= min_price)

    max_price = request.args.get("max_price", type=int)
    if max_price is not None:
        query = query.filter(Property.price <= max_price)

    # Area filters
    min_area = request.args.get("min_area", type=int)
    if min_area is not None:
        query = query.filter(Property.area >= min_area)

    max_area = request.args.get("max_area", type=int)
    if max_area is not None:
        query = query.filter(Property.area <= max_area)

    # Bedrooms filter
    bedrooms = request.args.get("bedrooms", type=int)
    if bedrooms is not None:
        query = query.filter_by(bedrooms=bedrooms)

    # Agent filter
    agent_id = request.args.get("agent_id", type=int)
    if agent_id:
        query = query.filter_by(agent_id=agent_id)

    # Search keyword
    search = request.args.get("search")
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            (Property.title.ilike(pattern)) |
            (Property.description.ilike(pattern)) |
            (Property.district.ilike(pattern)) |
            (Property.city.ilike(pattern))
        )

    properties = query.order_by(Property.created_at.desc()).all()
    return jsonify({"properties": [p.to_dict() for p in properties]})

@property_bp.get("/<int:property_id>")
def get_property(property_id):
    obj = Property.query.get(property_id)
    if not obj:
        return jsonify({"message": "ملک یافت نشد"}), 404
    return jsonify({"property": obj.to_dict()})

@property_bp.post("")
@jwt_required()
def create():
    data = request.get_json() or {}
    errors = PropertyCreateSchema().validate(data)
    if errors:
        return jsonify({"errors": errors}), 400
    current_user_id = int(get_jwt_identity())
    obj = create_property(current_user_id, data)
    return jsonify({
        "message": "ملک با موفقیت ثبت شد",
        "property": obj.to_dict()
    }), 201

@property_bp.put("/<int:property_id>")
@jwt_required()
def update(property_id):
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get("role") == "ADMIN"

    obj = Property.query.get(property_id)
    if not obj:
        return jsonify({"message": "ملک یافت نشد"}), 404

    if obj.agent_id != current_user_id and not is_admin:
        return jsonify({"message": "دسترسی غیرمجاز"}), 403

    data = request.get_json() or {}
    updated_obj = update_property(obj, data)
    return jsonify({
        "message": "ملک با موفقیت ویرایش شد",
        "property": updated_obj.to_dict()
    })

@property_bp.delete("/<int:property_id>")
@jwt_required()
def delete_property(property_id):
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get("role") == "ADMIN"

    obj = Property.query.get(property_id)
    if not obj:
        return jsonify({"message": "ملک یافت نشد"}), 404

    if obj.agent_id != current_user_id and not is_admin:
        return jsonify({"message": "شما اجازه حذف این ملک را ندارید"}), 403

    db.session.delete(obj)
    db.session.commit()
    return jsonify({"message": "ملک با موفقیت حذف شد"})

@property_bp.post("/<int:property_id>/images")
@jwt_required()
def upload_images(property_id):
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get("role") == "ADMIN"

    obj = Property.query.get(property_id)
    if not obj:
        return jsonify({"message": "ملک یافت نشد"}), 404

    if obj.agent_id != current_user_id and not is_admin:
        return jsonify({"message": "شما اجازه افزودن تصویر به این ملک را ندارید"}), 403

    files = request.files.getlist("images")
    if not files or all(f.filename == "" for f in files):
        return jsonify({"message": "هیچ تصویری ارسال نشده است"}), 400

    folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "properties", str(property_id))
    os.makedirs(folder, exist_ok=True)

    current_count = PropertyImage.query.filter_by(property_id=property_id).count()
    result = []

    for file in files:
        if not file.filename:
            continue
        ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
        if ext not in ALLOWED:
            return jsonify({"message": f"فرمت تصویر {ext} مجاز نیست. فرمت‌های مجاز: {', '.join(ALLOWED)}"}), 400
        filename = f"{uuid.uuid4().hex}.{ext}"
        file.save(os.path.join(folder, filename))
        image = PropertyImage(
            property_id=property_id,
            image_url=f"/uploads/properties/{property_id}/{filename}",
            is_primary=(current_count == 0 and len(result) == 0),
            sort_order=current_count + len(result)
        )
        db.session.add(image)
        result.append(image.image_url)

    db.session.commit()
    return jsonify({
        "message": f"{len(result)} تصویر با موفقیت بارگذاری شد",
        "images": result
    }), 201

@property_bp.delete("/<int:property_id>/images/<int:image_id>")
@jwt_required()
def delete_image(property_id, image_id):
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get("role") == "ADMIN"

    obj = Property.query.get(property_id)
    if not obj:
        return jsonify({"message": "ملک یافت نشد"}), 404

    if obj.agent_id != current_user_id and not is_admin:
        return jsonify({"message": "دسترسی غیرمجاز"}), 403

    img = PropertyImage.query.filter_by(id=image_id, property_id=property_id).first()
    if not img:
        return jsonify({"message": "تصویر یافت نشد"}), 404

    db.session.delete(img)
    db.session.commit()
    return jsonify({"message": "تصویر با موفقیت حذف شد"})
