import axios from "axios";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const apiBaseUrl = rawApiUrl || "http://localhost:1337/api";

if (!rawApiUrl && typeof window === "undefined") {
  // Server-side warning only: avoids noisy browser console spam.
  // eslint-disable-next-line no-console
  console.warn(
    "NEXT_PUBLIC_API_URL is not set. Falling back to http://localhost:1337/api"
  );
}

const API = axios.create({
  baseURL: apiBaseUrl,
});

export const getBlogs = async () => {
  const res = await API.get("/blogs?populate=*");
  return res.data.data;
};

export const getBlogBySlug = async (slug) => {
  if (!slug) return null;

  // URL-encode slug to avoid breaking the query string for special characters.
  const encodedSlug = encodeURIComponent(String(slug));
  const res = await API.get(
    `/blogs?filters[Slug][$eq]=${encodedSlug}&populate=*`
  );
  return res.data.data[0];
};

const normalizePhone = (phone) => {
  if (phone === undefined || phone === null) return null;
  const digitsOnly = String(phone).replace(/[^\d]/g, "");
  return digitsOnly.length ? digitsOnly : null;
};

export const requestOtp = async (form) => {
  return API.post("/subscribe", {
    data: {
      fullname: form.fullname,
      email: form.email,
      phone: normalizePhone(form.phone),
      organization: form.organization,
      interests: form.interests,
      source: form.source,
    },
  });
};

export const verifyOtp = async (form) => {
  return API.post("/verify-otp", {
    email: form.email,
    otp: form.otp,
    data: {
      fullname: form.fullname,
      email: form.email,
      phone: normalizePhone(form.phone),
      organization: form.organization,
      interests: form.interests,
      source: form.source,
    },
  });
};

