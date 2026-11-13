export const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : null;

export const guestId = () => {
  let id = localStorage.getItem("muli_guest");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("muli_guest", id);
  }
  return id;
};

export const errText = (detail, fallback = "Bir şeyler ters gitti, tekrar dene.") => {
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const msgs = detail.map((e) => (typeof e?.msg === "string" ? e.msg : "")).filter(Boolean);
    return msgs.length ? "Lütfen bilgilerini kontrol et." : fallback;
  }
  return typeof detail?.msg === "string" ? detail.msg : fallback;
};

export const apiFetch = async (path, opts = {}, retry = true) => {
  if (!API) throw new Error("Sunucuya ulaşılamıyor.");
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    ...opts,
    headers: { "Content-Type": "application/json", "X-Guest-Id": guestId(), ...(opts.headers || {}) },
  });
  if (res.status === 401 && retry && !path.startsWith("/auth/")) {
    const r = await fetch(`${API}/auth/refresh`, { method: "POST", credentials: "include" });
    if (r.ok) return apiFetch(path, opts, false);
  }
  return res;
};

export const apiJson = async (path, opts) => {
  const res = await apiFetch(path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(errText(data?.detail));
    e.status = res.status;
    throw e;
  }
  return data;
};
