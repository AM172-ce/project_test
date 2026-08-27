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

class BuyerRequestFeature(db.Model):
    __tablename__ = "buyer_request_features"
    id = db.Column(db.Integer, primary_key=True)
    buyer_request_id = db.Column(db.Integer, db.ForeignKey("buyer_requests.id"), nullable=False)
    feature = db.Column(db.String(50), nullable=False)
