import { useState } from "react";
import api from "../../api/axios";

export default function PropertyImageUploader({ propertyId, onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setError(null);
    setMessage(null);

    // Create preview URLs
    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const upload = async () => {
    if (!files.length) {
      setError("لطفاً حداقل یک تصویر انتخاب کنید.");
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

      setMessage("تصاویر با موفقیت بارگذاری شدند!");
      setFiles([]);
      setPreviews([]);

      if (onUploadSuccess) {
        onUploadSuccess(res.data.images);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "خطا در بارگذاری تصاویر";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="card" style={{ marginTop: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
        📸 افزودن تصاویر ملک
      </h3>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="file"
          multiple
          accept="image/*"
          id="property-file-input"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <label
          htmlFor="property-file-input"
          className="btn btn-outline"
          style={{ cursor: "pointer" }}
        >
          📁 انتخاب فایل‌های تصویر ({files.length} فایل انتخاب شده)
        </label>

        {files.length > 0 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={upload}
            disabled={loading}
          >
            {loading ? "در حال ارسال..." : "📤 شروع بارگذاری"}
          </button>
        )}
      </div>

      {previews.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <small style={{ color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
            پیش‌نمایش قبل از ارسال:
          </small>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="preview"
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border-color)" }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
