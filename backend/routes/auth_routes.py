from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from services.auth_service import create_user, authenticate_user

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    for field in ["first_name", "last_name", "mobile", "password"]:
        if not data.get(field):
            return jsonify({"message": f"{field} الزامی است."}), 400
    try:
        user = create_user(data["first_name"], data["last_name"], data["mobile"], data["password"], data.get("email"))
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 409
    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"message": "ثبت‌نام با موفقیت انجام شد.", "access_token": token, "user": user.to_dict()}), 201

@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    user = authenticate_user(data.get("mobile"), data.get("password"))
    if not user:
        return jsonify({"message": "شماره موبایل یا رمز عبور صحیح نیست."}), 401
    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"message": "ورود موفقیت‌آمیز بود.", "access_token": token, "user": user.to_dict()})

@auth_bp.get("/me")
@jwt_required()
def me():
    from models.user import User
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"message": "کاربر پیدا نشد."}), 404
    return jsonify({"user": user.to_dict()})
