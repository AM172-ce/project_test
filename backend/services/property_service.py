from extensions import db
from models.property import Property, PropertyFeature

def create_property(agent_id, data):
    obj = Property(
        agent_id=agent_id,
        title=data["title"],
        property_type=data["property_type"],
        transaction_type=data["transaction_type"],
        province=data.get("province"),
        city=data["city"],
        district=data.get("district"),
        address=data.get("address"),
        area=data["area"],
        bedrooms=data.get("bedrooms"),
        floor=data.get("floor"),
        total_floors=data.get("total_floors"),
        build_year=data.get("build_year"),
        price=data.get("price"),
        deposit=data.get("deposit"),
        rent=data.get("rent"),
        description=data.get("description"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude")
    )
    db.session.add(obj)
    db.session.flush()
    for feature in data.get("features", []):
        db.session.add(PropertyFeature(property_id=obj.id, feature=feature))
    db.session.commit()
    return obj
