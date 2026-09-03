from datetime import datetime
from extensions import db

class Property(db.Model):
    __tablename__ = "properties"
    id = db.Column(db.Integer, primary_key=True)
    agent_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    property_type = db.Column(db.String(50), nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)
    province = db.Column(db.String(100))
    city = db.Column(db.String(100), nullable=False)
    district = db.Column(db.String(100))
    address = db.Column(db.Text)
    area = db.Column(db.Integer, nullable=False)
    bedrooms = db.Column(db.Integer)
    floor = db.Column(db.Integer)
    total_floors = db.Column(db.Integer)
    build_year = db.Column(db.Integer)
    price = db.Column(db.BigInteger)
    deposit = db.Column(db.BigInteger)
    rent = db.Column(db.BigInteger)
    description = db.Column(db.Text)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    status = db.Column(db.String(20), nullable=False, default="ACTIVE")
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    images = db.relationship("PropertyImage", backref="property", cascade="all, delete-orphan", lazy="select", order_by="PropertyImage.sort_order")
    features = db.relationship("PropertyFeature", backref="property", cascade="all, delete-orphan", lazy="select")
    agent = db.relationship("User", backref="properties")

    def to_dict(self):
        primary_img = None
        for img in self.images:
            if img.is_primary:
                primary_img = img.image_url
                break
        if not primary_img and self.images:
            primary_img = self.images[0].image_url

        return {
            "id": self.id,
            "agent_id": self.agent_id,
            "agent_name": f"{self.agent.first_name} {self.agent.last_name}" if self.agent else None,
            "agent_mobile": self.agent.mobile if self.agent else None,
            "title": self.title,
            "property_type": self.property_type,
            "transaction_type": self.transaction_type,
            "province": self.province,
            "city": self.city,
            "district": self.district,
            "address": self.address,
            "area": self.area,
            "bedrooms": self.bedrooms,
            "floor": self.floor,
            "total_floors": self.total_floors,
            "build_year": self.build_year,
            "price": self.price,
            "deposit": self.deposit,
            "rent": self.rent,
            "description": self.description,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "status": self.status,
            "features": [f.feature for f in self.features],
            "images": [img.to_dict() for img in self.images],
            "primary_image": primary_img,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class PropertyImage(db.Model):
    __tablename__ = "property_images"
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey("properties.id"), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    is_primary = db.Column(db.Boolean, nullable=False, default=False)
    sort_order = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "property_id": self.property_id,
            "image_url": self.image_url,
            "is_primary": self.is_primary,
            "sort_order": self.sort_order,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class PropertyFeature(db.Model):
    __tablename__ = "property_features"
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey("properties.id"), nullable=False)
    feature = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "property_id": self.property_id,
            "feature": self.feature,
        }
