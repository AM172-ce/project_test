from app import app
from extensions import db
from models.user import User
from models.property import Property, PropertyFeature, PropertyImage
from models.buyer_request import BuyerRequest, BuyerRequestFeature
from models.matching_result import MatchingResult
from matching.engine import calculate_match

with app.app_context():
    db.create_all()

    # 1. Seed Users
    users = [
        ("مدیر", "سیستم", "09120000001", "ADMIN"),
        ("علی", "مشاور", "09120000002", "AGENT"),
        ("رضا", "خریدار", "09120000003", "BUYER"),
    ]

    for first, last, mobile, role in users:
        user = User.query.filter_by(mobile=mobile).first()
        if not user:
            user = User(first_name=first, last_name=last, mobile=mobile, role=role)
            user.set_password("Password123!")
            db.session.add(user)
        else:
            user.first_name = first
            user.last_name = last
            user.role = role
            user.set_password("Password123!")

    db.session.commit()

    admin = User.query.filter_by(mobile="09120000001").first()
    agent = User.query.filter_by(mobile="09120000002").first()
    buyer = User.query.filter_by(mobile="09120000003").first()

    # 2. Seed Properties for Agent
    if agent:
        sample_properties = [
            {
                "title": "آپارتمان نوساز ۱۲۰ متری در گوهردشت",
                "property_type": "APARTMENT",
                "transaction_type": "SALE",
                "province": "البرز",
                "city": "کرج",
                "district": "گوهردشت",
                "address": "خیابان اصلی گوهردشت، نبش خیابان هفتم شرقی",
                "area": 120,
                "bedrooms": 2,
                "floor": 3,
                "total_floors": 5,
                "build_year": 1401,
                "price": 8000000000,
                "deposit": None,
                "rent": None,
                "description": "آپارتمان خوش‌نقشه، نورگیر عالی، سازه بتنی مستحکم، متریال درجه یک، دسترسی فوق‌العاده به مراکز خرید و خیابان اصلی",
                "latitude": 35.8450,
                "longitude": 50.9850,
                "features": ["PARKING", "ELEVATOR", "STORAGE", "BALCONY"]
            },
            {
                "title": "ویلای دوبلکس مدرن ۳۵۰ متری در مهرشهر",
                "property_type": "VILLA",
                "transaction_type": "SALE",
                "province": "البرز",
                "city": "کرج",
                "district": "مهرشهر",
                "address": "بلوار شهرداری، فاز یک، خیابان صدم",
                "area": 350,
                "bedrooms": 4,
                "floor": 1,
                "total_floors": 2,
                "build_year": 1402,
                "price": 25000000000,
                "deposit": None,
                "rent": None,
                "description": "ویلای دوبلکس استخردار در بهترین لوکیشن فاز ۱ مهرشهر، حیاط‌سازی زیبا، آلاچیق، درختان مثمر، روف‌گاردن و سیستم هوشمند",
                "latitude": 35.8050,
                "longitude": 50.9150,
                "features": ["PARKING", "STORAGE", "POOL", "GARDEN", "BALCONY"]
            },
            {
                "title": "واحد اداری تجاری ۸۵ متری در سعادت‌آباد",
                "property_type": "OFFICE",
                "transaction_type": "RENT",
                "province": "تهران",
                "city": "تهران",
                "district": "سعادت‌آباد",
                "address": "میدان کاج، خیابان سرو غربی، مجتمع تجاری نگین",
                "area": 85,
                "bedrooms": 2,
                "floor": 4,
                "total_floors": 8,
                "build_year": 1399,
                "price": None,
                "deposit": 600000000,
                "rent": 40000000,
                "description": "مناسب مطب، دفتر وکالت و شرکت‌های معتبر، لابی شیک با لابی‌من ۲۴ ساعته، موقعیت اداری تابلوخور",
                "latitude": 35.7820,
                "longitude": 51.3730,
                "features": ["PARKING", "ELEVATOR", "LOBBY", "STORAGE"]
            }
        ]

        for pdata in sample_properties:
            existing = Property.query.filter_by(title=pdata["title"], agent_id=agent.id).first()
            if not existing:
                prop = Property(
                    agent_id=agent.id,
                    title=pdata["title"],
                    property_type=pdata["property_type"],
                    transaction_type=pdata["transaction_type"],
                    province=pdata["province"],
                    city=pdata["city"],
                    district=pdata["district"],
                    address=pdata["address"],
                    area=pdata["area"],
                    bedrooms=pdata["bedrooms"],
                    floor=pdata["floor"],
                    total_floors=pdata["total_floors"],
                    build_year=pdata["build_year"],
                    price=pdata["price"],
                    deposit=pdata["deposit"],
                    rent=pdata["rent"],
                    description=pdata["description"],
                    latitude=pdata["latitude"],
                    longitude=pdata["longitude"],
                    status="ACTIVE"
                )
                db.session.add(prop)
                db.session.flush()
                for feat in pdata["features"]:
                    db.session.add(PropertyFeature(property_id=prop.id, feature=feat))

        db.session.commit()

    # 3. Seed Buyer Requests
    if buyer:
        sample_requests = [
            {
                "property_type": "APARTMENT",
                "transaction_type": "SALE",
                "province": "البرز",
                "city": "کرج",
                "district": "گوهردشت",
                "min_area": 100,
                "max_area": 135,
                "bedrooms": 2,
                "min_price": 7000000000,
                "max_price": 8500000000,
                "description": "به دنبال آپارتمان ۲ خوابه نوساز یا چندساله تمیز در فازهای گوهردشت با پارکینگ و آسانسور",
                "features": ["PARKING", "ELEVATOR", "STORAGE"]
            },
            {
                "property_type": "VILLA",
                "transaction_type": "SALE",
                "province": "البرز",
                "city": "کرج",
                "district": "مهرشهر",
                "min_area": 300,
                "max_area": 450,
                "bedrooms": 4,
                "min_price": 20000000000,
                "max_price": 28000000000,
                "description": "خریدار نقد ویلا در مهرشهر فاز ۱ یا ۲، ترجیحاً استخردار با حیاط اختصاصی",
                "features": ["POOL", "PARKING", "GARDEN"]
            },
            {
                "property_type": "OFFICE",
                "transaction_type": "RENT",
                "province": "تهران",
                "city": "تهران",
                "district": "سعادت‌آباد",
                "min_area": 70,
                "max_area": 100,
                "bedrooms": 2,
                "min_price": None,
                "max_price": None,
                "description": "اجاره واحد اداری برای شرکت فناوری، دسترسی آسان به مترو و اتوبان، دارای آسانسور و پارکینگ",
                "features": ["ELEVATOR", "PARKING"]
            }
        ]

        for rdata in sample_requests:
            existing_req = BuyerRequest.query.filter_by(
                buyer_id=buyer.id,
                property_type=rdata["property_type"],
                district=rdata["district"]
            ).first()
            if not existing_req:
                req = BuyerRequest(
                    buyer_id=buyer.id,
                    property_type=rdata["property_type"],
                    transaction_type=rdata["transaction_type"],
                    province=rdata["province"],
                    city=rdata["city"],
                    district=rdata["district"],
                    min_area=rdata["min_area"],
                    max_area=rdata["max_area"],
                    bedrooms=rdata["bedrooms"],
                    min_price=rdata["min_price"],
                    max_price=rdata["max_price"],
                    description=rdata["description"],
                    status="OPEN"
                )
                db.session.add(req)
                db.session.flush()
                for feat in rdata["features"]:
                    db.session.add(BuyerRequestFeature(buyer_request_id=req.id, feature=feat))

        db.session.commit()

    # 4. Pre-run Matching
    MatchingResult.query.delete()
    requests = BuyerRequest.query.filter_by(status="OPEN").all()
    properties = Property.query.filter_by(status="ACTIVE").all()

    for r in requests:
        rf = [f.feature for f in r.features]
        for p in properties:
            if r.transaction_type and p.transaction_type and r.transaction_type != p.transaction_type:
                continue
            pf = [f.feature for f in p.features]
            res = calculate_match(p, r, pf, rf)
            if res["score"] >= 20.0:
                mr = MatchingResult(
                    buyer_request_id=r.id,
                    property_id=p.id,
                    score=res["score"],
                    price_score=res["price"],
                    location_score=res["location"],
                    area_score=res["area"],
                    bedroom_score=res["bedroom"],
                    type_score=res["type"],
                    feature_score=res["features"]
                )
                db.session.add(mr)

    db.session.commit()
    print("Seed completed successfully with Users, Properties, Buyer Requests, and Matches.")
