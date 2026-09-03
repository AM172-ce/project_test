from datetime import datetime
from extensions import db

class BuyerRequest(db.Model):
    __tablename__ = "buyer_requests"
    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    property_type = db.Column(db.String(50), nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)
    province = db.Column(db.String(100))
    city = db.Column(db.String(100), nullable=False)
    district = db.Column(db.String(100))
    min_area = db.Column(db.Integer)
    max_area = db.Column(db.Integer)
    bedrooms = db.Column(db.Integer)
    min_price = db.Column(db.BigInteger)
    max_price = db.Column(db.BigInteger)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), nullable=False, default="OPEN")
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    features = db.relationship("BuyerRequestFeature", backref="buyer_request", cascade="all, delete-orphan", lazy="select")
    buyer = db.relationship("User", backref="buyer_requests")

    def to_dict(self):
        return {
            "id": self.id,
            "buyer_id": self.buyer_id,
            "buyer_name": f"{self.buyer.first_name} {self.buyer.last_name}" if self.buyer else None,
            "buyer_mobile": self.buyer.mobile if self.buyer else None,
            "property_type": self.property_type,
            "transaction_type": self.transaction_type,
            "province": self.province,
            "city": self.city,
            "district": self.district,
            "min_area": self.min_area,
            "max_area": self.max_area,
            "bedrooms": self.bedrooms,
            "min_price": self.min_price,
            "max_price": self.max_price,
            "description": self.description,
            "status": self.status,
            "features": [f.feature for f in self.features],
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class BuyerRequestFeature(db.Model):
    __tablename__ = "buyer_request_features"
    id = db.Column(db.Integer, primary_key=True)
    buyer_request_id = db.Column(db.Integer, db.ForeignKey("buyer_requests.id"), nullable=False)
    feature = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "buyer_request_id": self.buyer_request_id,
            "feature": self.feature,
        }
