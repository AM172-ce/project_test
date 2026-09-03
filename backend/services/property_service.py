from extensions import db
from models.property import Property, PropertyFeature

def create_property(agent_id, data):
    obj = Property(
        agent_id=int(agent_id),
        title=data["title"],
        property_type=data["property_type"],
        transaction_type=data["transaction_type"],
        province=data.get("province"),
        city=data["city"],
        district=data.get("district"),
        address=data.get("address"),
        area=int(data["area"]),
        bedrooms=int(data["bedrooms"]) if data.get("bedrooms") is not None else None,
        floor=int(data["floor"]) if data.get("floor") is not None else None,
        total_floors=int(data["total_floors"]) if data.get("total_floors") is not None else None,
        build_year=int(data["build_year"]) if data.get("build_year") is not None else None,
        price=int(data["price"]) if data.get("price") is not None else None,
        deposit=int(data["deposit"]) if data.get("deposit") is not None else None,
        rent=int(data["rent"]) if data.get("rent") is not None else None,
        description=data.get("description"),
        latitude=float(data["latitude"]) if data.get("latitude") is not None else None,
        longitude=float(data["longitude"]) if data.get("longitude") is not None else None,
        status=data.get("status", "ACTIVE")
    )
    db.session.add(obj)
    db.session.flush()
    for feature in data.get("features", []):
        if feature and feature.strip():
            db.session.add(PropertyFeature(property_id=obj.id, feature=feature.strip()))
    db.session.commit()
    return obj

def update_property(property_obj, data):
    for field in ["title", "property_type", "transaction_type", "province", "city", "district", "address", "description", "status"]:
        if field in data:
            setattr(property_obj, field, data[field])

    for field in ["area", "bedrooms", "floor", "total_floors", "build_year", "price", "deposit", "rent"]:
        if field in data:
            val = data[field]
            setattr(property_obj, field, int(val) if val is not None else None)

    for field in ["latitude", "longitude"]:
        if field in data:
            val = data[field]
            setattr(property_obj, field, float(val) if val is not None else None)

    if "features" in data:
        PropertyFeature.query.filter_by(property_id=property_obj.id).delete()
        for feature in data["features"]:
            if feature and feature.strip():
                db.session.add(PropertyFeature(property_id=property_obj.id, feature=feature.strip()))

    db.session.commit()
    return property_obj
