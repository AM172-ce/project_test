* Flask REST API
* JWT Authentication
* PostgreSQL 16
* SQLAlchemy + Flask-Migrate
* User / Property / Buyer Request / Matching models
* Property image upload API
* React/Vite frontend
* Docker Compose
* Seed data

## اجرا

پیش‌نیاز: Docker Desktop

&#x20;   docker compose up --build



در ترمینال دوم:

&#x20;   docker compose exec backend flask db upgrade
docker compose exec backend python seed.py



URL :

* http://localhost:5000/health
* http://localhost:5173
* 

کاربران Seed:

* ADMIN: 09120000001 / Password123!
* AGENT: 09120000002 / Password123!
* BUYER: 09120000003 / Password123!
* 

