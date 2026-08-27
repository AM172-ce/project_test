from datetime import datetime
from extensions import db

class MatchingResult(db.Model):
    __tablename__ = "matching_results"
    id = db.Column(db.Integer, primary_key=True)
    buyer_request_id = db.Column(db.Integer, db.ForeignKey("buyer_requests.id"), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey("properties.id"), nullable=False)
    score = db.Column(db.Float, nullable=False)
    price_score = db.Column(db.Float)
    location_score = db.Column(db.Float)
    area_score = db.Column(db.Float)
    bedroom_score = db.Column(db.Float)
    type_score = db.Column(db.Float)
    feature_score = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
