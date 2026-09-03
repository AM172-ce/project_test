import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, SEED_USERS } from "../context/AuthContext";

const SECTIONS = [
  { to: "/dashboard", title: "داشبورد", desc: "آمار کلی املاک، درخواست‌ها و تطابق‌ها، به همراه اجرای موتور تطابق." },
  { to: "/properties", title: "املاک", desc: "جستجو و فیلتر روی همه فایل‌های ثبت‌شده." },
  { to: "/properties/new", title: "ثبت ملک", desc: "ایجاد فایل جدید همراه با تصویر و مختصات جغرافیایی." },
  { to: "/requests", title: "درخواست‌های خرید", desc: "مشاهده و ثبت تقاضای خریداران." },
  { to: "/matching", title: "موتور تطابق", desc: "امتیازدهی ملک و درخواست بر اساس هفت معیار وزن‌دار." },
  { to: "/login", title: "حساب کاربری", desc: "ورود و ثبت‌نام مبتنی بر توکن JWT." },
];

export default function HomePage() {
  const { quickLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const enter = async (role) => {
    await quickLogin(role);
    navigate("/dashboard");
  };

  return (
    <div>
      <section className="hero">
        <h1 className="display">سامانه مدیریت و تطابق املاک</h1>
        <p className="lead">
          ثبت فایل، دریافت تقاضای خریدار و تطبیق هوشمند آن‌ها بر پایه قیمت، موقعیت،
          متراژ و امکانات — همه در یک محیط یکپارچه.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn btn-primary">ورود به داشبورد</Link>
              <Link to="/properties" className="btn btn-outline">مشاهده املاک</Link>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => enter("AGENT")}>
                ورود به عنوان مشاور
              </button>
              <button className="btn btn-outline" onClick={() => enter("BUYER")}>
                ورود به عنوان خریدار
              </button>
            </>
          )}
        </div>

        {isAuthenticated && (
          <p className="muted" style={{ marginTop: 16 }}>
            وارد شده با حساب {user?.first_name} {user?.last_name}
          </p>
        )}
      </section>

      <section style={{ marginBottom: 48 }}>
        <div className="grid-3">
          {SECTIONS.map((s) => (
            <Link to={s.to} key={s.to} className="card card-link">
              <h3 className="card-title">{s.title}</h3>
              <p className="card-body">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="card card-quiet">
        <h3 className="card-title">راه‌اندازی و حساب‌های آزمایشی</h3>
        <p className="card-body" style={{ marginBottom: 16 }}>
          پس از بالا آمدن کانتینرها، دستور زیر داده نمونه را ایجاد می‌کند. رمز عبور هر سه
          حساب <code>Password123!</code> است.
        </p>
        <pre className="code-block">{`docker compose up --build
docker compose exec backend python seed.py`}</pre>

        <dl className="spec-list" style={{ marginTop: 20 }}>
          {Object.entries(SEED_USERS).map(([role, u]) => (
            <React.Fragment key={role}>
              <dt>{u.name}</dt>
              <dd>{u.mobile}</dd>
            </React.Fragment>
          ))}
        </dl>
      </section>
    </div>
  );
}
