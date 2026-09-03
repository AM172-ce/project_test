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

    property_obj = db.relationship("Property", backref="matching_results")
    buyer_request = db.relationship("BuyerRequest", backref="matching_results")

    def to_dict(self):
        return {
            "id": self.id,
            "buyer_request_id": self.buyer_request_id,
            "property_id": self.property_id,
            "score": self.score,
            "price_score": self.price_score,
            "location_score": self.location_score,
            "area_score": self.area_score,
            "bedroom_score": self.bedroom_score,
            "type_score": self.type_score,
            "feature_score": self.feature_score,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "property": self.property_obj.to_dict() if self.property_obj else None,
            "buyer_request": self.buyer_request.to_dict() if self.buyer_request else None,
        }
