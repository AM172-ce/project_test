import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.property import Property, PropertyImage
from schemas.property import PropertyCreateSchema
from services.property_service import create_property

property_bp = Blueprint("properties", __name__, url_prefix="/api/properties")
ALLOWED = {"jpg", "jpeg", "png", "webp"}

@property_bp.post("")
@jwt_required()
def create():
    data = request.get_json() or {}
    errors = PropertyCreateSchema().validate(data)
    if errors:
        return jsonify({"errors": errors}), 400
    obj = create_property(get_jwt_identity(), data)
    return jsonify({"message": "ملک با موفقیت ثبت شد", "property": {"id": obj.id, "title": obj.title}}), 201

@property_bp.post("/<int:property_id>/images")
@jwt_required()
def upload_images(property_id):
    obj = Property.query.filter_by(id=property_id, agent_id=get_jwt_identity()).first()
    if not obj:
        return jsonify({"message": "ملک یافت نشد"}), 404
    files = request.files.getlist("images")
    folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "properties", str(property_id))
    os.makedirs(folder, exist_ok=True)
    result = []
    for file in files:
        if not file.filename:
            continue
        ext = file.filename.rsplit(".", 1)[-1].lower()
        if ext not in ALLOWED:
            return jsonify({"message": "فرمت تصویر مجاز نیست"}), 400
        filename = f"{uuid.uuid4().hex}.{ext}"
        file.save(os.path.join(folder, filename))
        image = PropertyImage(
            property_id=property_id,
            image_url=f"/uploads/properties/{property_id}/{filename}",
            is_primary=(len(result) == 0),
            sort_order=len(result)
        )
        db.session.add(image)
        result.append(image.image_url)
    db.session.commit()
    return jsonify({"images": result}), 201
