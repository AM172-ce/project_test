export const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "آپارتمان" },
  { value: "VILLA", label: "ویلا" },
  { value: "OFFICE", label: "اداری" },
  { value: "COMMERCIAL", label: "تجاری" },
  { value: "LAND", label: "زمین" },
];

export const TRANSACTION_TYPES = [
  { value: "SALE", label: "فروش" },
  { value: "RENT", label: "رهن و اجاره" },
];

export const FEATURES = [
  { value: "PARKING", label: "پارکینگ" },
  { value: "ELEVATOR", label: "آسانسور" },
  { value: "STORAGE", label: "انباری" },
  { value: "BALCONY", label: "بالکن" },
  { value: "POOL", label: "استخر" },
  { value: "YARD", label: "حیاط" },
];

export const typeLabel = (v) =>
  PROPERTY_TYPES.find((t) => t.value === v)?.label || v || "-";
export const transactionLabel = (v) =>
  TRANSACTION_TYPES.find((t) => t.value === v)?.label || v || "-";
export const featureLabel = (v) =>
  FEATURES.find((f) => f.value === v)?.label || v;

export function formatPrice(val) {
  if (!val) return "توافقی";
  if (val >= 1000000000)
    return `${(val / 1000000000).toLocaleString("fa-IR")} میلیارد تومان`;
  if (val >= 1000000)
    return `${(val / 1000000).toLocaleString("fa-IR")} میلیون تومان`;
  return `${val.toLocaleString("fa-IR")} تومان`;
}

export function scoreClass(s) {
  if (s >= 75) return "high";
  if (s >= 40) return "mid";
  return "low";
}

export function apiError(err, fallback = "خطایی رخ داد") {
  return err?.response?.data?.message || err?.message || fallback;
}
