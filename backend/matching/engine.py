from matching.constants import MATCH_WEIGHTS

def range_score(value, minimum=None, maximum=None):
    if value is None:
        return 0
    if minimum is not None and value < minimum:
        return max(0, 100 - ((minimum - value) / minimum) * 100)
    if maximum is not None and value > maximum:
        return max(0, 100 - ((value - maximum) / maximum) * 100)
    return 100

def calculate_match(property_obj, buyer_request, property_features=None, requested_features=None):
    property_features = set(property_features or [])
    requested_features = set(requested_features or [])
    scores = {
        "price": range_score(property_obj.price, getattr(buyer_request, "min_price", None), getattr(buyer_request, "max_price", None)),
        "location": 100 if property_obj.city == getattr(buyer_request, "city", None) and (not getattr(buyer_request, "district", None) or property_obj.district == buyer_request.district) else 0,
        "area": range_score(property_obj.area, getattr(buyer_request, "min_area", None), getattr(buyer_request, "max_area", None)),
        "bedroom": 100 if not getattr(buyer_request, "bedrooms", None) else max(0, 100 - abs((property_obj.bedrooms or 0) - buyer_request.bedrooms) * 30),
        "type": 100 if property_obj.property_type == getattr(buyer_request, "property_type", None) else 0,
        "features": 100 if not requested_features else len(property_features & requested_features) / len(requested_features) * 100,
        "build_year": 100
    }
    score = sum(scores[k] * MATCH_WEIGHTS[k] for k in MATCH_WEIGHTS)
    return {"score": round(score, 2), **{k: round(v, 2) for k, v in scores.items()}}
