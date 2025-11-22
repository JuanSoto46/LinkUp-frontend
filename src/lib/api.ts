const API = import.meta.env.VITE_API_URL;

/**
 * Performs an authenticated fetch against the backend API.
 * Adds JSON headers and Firebase ID token in Authorization header.
 */
async function authedFetch(path: string, options: RequestInit = {}) {
  const { getIdToken } = await import("./firebase");
  const token = await getIdToken();

  if (!token) {
    // Frontend-level guard: caller should handle this as "session expired"
    throw new Error("AUTH_REQUIRED");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const text = await res.text();

  if (!res.ok) {
    // Backend usually sends JSON with { success, error }
    throw new Error(text || "API_ERROR");
  }

  return text ? JSON.parse(text) : null;
}

export const api = {
  getUser: (uid: string) => authedFetch(`/api/users/${uid}`),

  updateUser: (uid: string, payload: any) =>
    authedFetch(`/api/users/${uid}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteUser: (uid: string) =>
    authedFetch(`/api/users/${uid}`, { method: "DELETE" }),

  createMeeting: (payload: {
    title: string;
    scheduledAt?: string;
    description?: string;
  }) =>
    authedFetch(`/api/meetings`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // This one does NOT need auth header (registration)
  registerProfile: (payload: {
    firstName: string;
    lastName: string;
    age: number;
    email: string;
    password: string;
  }) =>
    fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(async (r) => {
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    }),
};
