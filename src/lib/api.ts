const API = import.meta.env.VITE_API_URL;

/**
 * Performs an authenticated fetch against the backend API.
 * Adds JSON headers and Firebase ID token in Authorization header.
 */
async function authedFetch(path: string, options: RequestInit = {}) {
  const { getIdToken } = await import("./firebase");
  const token = await getIdToken();

  if (!token) throw new Error("AUTH_REQUIRED");

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      "Error inesperado en el servidor";
    throw new Error(msg);
  }

  return data;
}

export const api = {
  /**
   * Register user profile (NO auth yet)
   */
  registerProfile: (profile: {
    firstName: string;
    lastName: string;
    age: number;
    email: string;
    password: string;
  }) =>
    fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    }).then(async (r) => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(
          data?.error || data?.message || (await r.text())
        );
      }
      return data;
    }),

  /**
   * Get user profile by uid
   */
  getUser: (uid: string) =>
    authedFetch(`/api/users/${uid}`, { method: "GET" }),

  /**
   * Update user profile by uid
   */
  updateUser: (
    uid: string,
    profile: {
      firstName?: string;
      lastName?: string;
      age?: number | null;
      email?: string;
      password?: string;
    }
  ) =>
    authedFetch(`/api/users/${uid}`, {
      method: "PUT",
      body: JSON.stringify(profile),
    }),

  /**
   * Delete user
   */
  deleteUser: (uid: string) =>
    authedFetch(`/api/users/${uid}`, { method: "DELETE" }),

  /**
   * Create a meeting
   */
  createMeeting: (meeting: {
    title: string;
    scheduledAt?: string;
    description?: string;
  }) =>
    authedFetch(`/api/meetings`, {
      method: "POST",
      body: JSON.stringify(meeting),
    }),

  /**
   * ✅ List meetings for current user
   */
  getMeetings: () =>
    authedFetch(`/api/meetings`, { method: "GET" }),

  // Create profile for OAuth users (after first login)
  createOAuthProfile: (payload: {
    userProfile: {
      displayName: string | null; 
      age: number | null;
      email: string | null;
      uid: string;
    }
    provider: string;
  }) =>
    authedFetch(`/api/oauth/${payload.provider}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
