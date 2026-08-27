from app import app
from extensions import db
from models.user import User
from models.property import Property, PropertyFeature

with app.app_context():
    db.create_all()

    users = [
        ("مدیر", "سیستم", "09120000001", "ADMIN"),
        ("علی", "مشاور", "09120000002", "AGENT"),
        ("رضا", "خریدار", "09120000003", "BUYER"),
    ]

    for first, last, mobile, role in users:
        if not User.query.filter_by(mobile=mobile).first():
            user = User(first_name=first, last_name=last, mobile=mobile, role=role)
            user.set_password("Password123!")
            db.session.add(user)

    db.session.commit()
    agent = User.query.filter_by(mobile="09120000002").first()

    if agent and not Property.query.filter_by(agent_id=agent.id).first():
        prop = Property(
            agent_id=agent.id,
            title="آپارتمان نمونه ۱۲۰ متری",
            property_type="APARTMENT",
            transaction_type="SALE",
            province="البرز",
            city="کرج",
            district="گوهردشت",
            address="آدرس نمونه",
            area=120,
            bedrooms=2,
            floor=3,
            total_floors=5,
            build_year=1400,
            price=8000000000,
            description="ملک نمونه برای تست پروژه",
            latitude=35.8200,
            longitude=50.9500
        )
        db.session.add(prop)
        db.session.flush()
        for feature in ["PARKING", "ELEVATOR", "STORAGE"]:
            db.session.add(PropertyFeature(property_id=prop.id, feature=feature))
        db.session.commit()

    print("Seed completed successfully.")
