import { useState } from "react";
import api from "../../api/axios";
import { apiError } from "../../utils/format";

export default function PropertyImageUploader({ propertyId, onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setError(null);
    setMessage(null);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const upload = async () => {
    if (!files.length) {
      setError("ابتدا یک یا چند تصویر انتخاب کنید.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      files.forEach((f) => form.append("images", f));
      const res = await api.post(`/properties/${propertyId}/images`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message || "تصاویر بارگذاری شد.");
      setFiles([]);
      setPreviews([]);
      onUploadSuccess?.(res.data.images);
    } catch (err) {
      setError(apiError(err, "خطا در بارگذاری تصاویر"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card" style={{ marginTop: 20 }}>
      <h3 className="card-title">افزودن تصویر</h3>
      <p className="card-body" style={{ marginBottom: 16 }}>
        فرمت‌های مجاز: JPG، JPEG، PNG، WEBP
      </p>

      {message && <div className="alert alert-positive">{message}</div>}
      {error && <div className="alert alert-critical">{error}</div>}

      <div className="row">
        <input
          type="file"
          multiple
          accept="image/*"
          id="property-file-input"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <label htmlFor="property-file-input" className="btn btn-outline btn-sm" style={{ cursor: "pointer" }}>
          انتخاب فایل
        </label>
        <span className="muted">
          {files.length ? `${files.length} فایل انتخاب شد` : "فایلی انتخاب نشده"}
        </span>
        {files.length > 0 && (
          <button type="button" className="btn btn-primary btn-sm" onClick={upload} disabled={loading}>
            {loading ? "در حال ارسال" : "بارگذاری"}
          </button>
        )}
      </div>

      {previews.length > 0 && (
        <div className="preview-row">
          {previews.map((src, i) => (
            <img key={i} src={src} alt="" />
          ))}
        </div>
      )}
    </section>
  );
}
