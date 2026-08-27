from extensions import db
from models.user import User

def create_user(first_name, last_name, mobile, password, email=None):
    if User.query.filter_by(mobile=mobile).first():
        raise ValueError("کاربری با این شماره موبایل قبلاً ثبت شده است.")
    user = User(first_name=first_name, last_name=last_name, mobile=mobile, email=email, role="BUYER")
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return user

def authenticate_user(mobile, password):
    if not mobile or not password:
        return None
    user = User.query.filter_by(mobile=mobile).first()
    if not user or not user.is_active or not user.check_password(password):
        return None
    return user
