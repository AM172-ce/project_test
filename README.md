# 🏠 خانه من (Khaneh) — Real Estate Matching Platform

* Flask REST API
* JWT Authentication
* PostgreSQL 16
* SQLAlchemy + Flask-Migrate
* User / Property / Buyer Request / Matching models
* Property image upload API
* React/Vite frontend — **full test panel UI** (login, properties, requests, matching)
* Docker Compose
* Seed data

---

## اجرا (Run)

پیش‌نیاز: Docker / Docker Compose

```bash
docker compose up --build
```

در ترمینال دوم، داده نمونه را بسازید:

```bash
docker compose exec backend python seed.py
```

> جداول دیتابیس هنگام بالا آمدن بک‌اند به‌صورت خودکار ساخته می‌شوند
> (`db.create_all()`)، بنابراین `flask db upgrade` اجباری نیست.

### URLs

* فرانت‌اند (پنل تست): <http://localhost:5173>
* سلامت بک‌اند: <http://localhost:5000/health>

اگر روی VM هستید، به‌جای `localhost` از IP همان VM استفاده کنید — فرانت‌اند
درخواست‌ها را به‌صورت نسبی (`/api`) می‌فرستد و Vite آن‌ها را به کانتینر بک‌اند
پروکسی می‌کند، پس با هر IP/هاستی کار می‌کند.

### کاربران Seed (رمز همه: `Password123!`)

| نقش | موبایل |
| --- | --- |
| ADMIN | 09120000001 |
| AGENT | 09120000002 |
| BUYER | 09120000003 |

در نوار بالای سایت دکمه‌های «تست سریع» وجود دارد که با یک کلیک با هر کدام از این
کاربران وارد می‌شوید.

---

## صفحات فرانت‌اند (چه چیزی را می‌توان تست کرد)

| مسیر | کاربرد | API |
| --- | --- | --- |
| `/` | خانه + ورود سریع | — |
| `/login`, `/register` | احراز هویت JWT | `POST /api/auth/login`, `/register`, `GET /api/auth/me` |
| `/dashboard` | آمار + اجرای موتور تطابق | `GET /api/stats`, `POST /api/matches/run` |
| `/properties` | لیست + فیلتر املاک | `GET /api/properties` |
| `/properties/new` | ثبت ملک (دکمه «داده نمونه» دارد) | `POST /api/properties` |
| `/properties/:id` | جزئیات، آپلود/حذف تصویر، نقشه، حذف ملک | `GET/PUT/DELETE /api/properties/:id`, `POST/DELETE .../images` |
| `/requests` | لیست درخواست‌های خرید | `GET /api/buyer-requests` |
| `/requests/new` | ثبت درخواست خرید | `POST /api/buyer-requests` |
| `/matching` | موتور تطابق با نمودار امتیاز هر معیار | `GET /api/matches/request/:id`, `/property/:id`, `GET /api/matches/saved` |

---

## API خلاصه

```
GET    /health
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                       (JWT)

GET    /api/properties                    ?search&city&district&property_type
                                          &transaction_type&min_price&max_price
                                          &min_area&max_area&bedrooms&status&agent_id
GET    /api/properties/<id>
POST   /api/properties                    (JWT)
PUT    /api/properties/<id>               (JWT، مالک یا ADMIN)
DELETE /api/properties/<id>               (JWT، مالک یا ADMIN)
POST   /api/properties/<id>/images        (JWT، multipart field: images)
DELETE /api/properties/<id>/images/<img>  (JWT)
GET    /uploads/<path>                    (سرو فایل تصاویر)

GET    /api/buyer-requests                ?city&district&property_type&transaction_type&status
GET    /api/buyer-requests/<id>
POST   /api/buyer-requests                (JWT)
PUT    /api/buyer-requests/<id>           (JWT)
DELETE /api/buyer-requests/<id>           (JWT)

GET    /api/matches/request/<id>          ملک‌های متناسب با یک درخواست
GET    /api/matches/property/<id>         خریداران متناسب با یک ملک
POST   /api/matches/run                   محاسبه و ذخیره همه تطابق‌ها
GET    /api/matches/saved                 تطابق‌های ذخیره‌شده

GET    /api/stats                         آمار داشبورد
```

### وزن معیارهای موتور تطابق

قیمت ۲۵٪ • موقعیت ۲۰٪ • متراژ ۱۵٪ • اتاق خواب ۱۰٪ • نوع ملک ۱۰٪ • امکانات ۱۰٪ • سال ساخت ۱۰٪

---

## اجرای بدون Docker (اختیاری)

```bash
# backend
cd backend
pip install -r requirements.txt
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/khaneh" python app.py

# frontend (ترمینال دیگر)
cd frontend
npm install
npm run dev     # به http://localhost:5000 پروکسی می‌کند
```
