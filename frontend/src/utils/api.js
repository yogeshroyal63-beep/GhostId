const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_KEY = import.meta.env.VITE_API_KEY || "";

function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (API_KEY) headers["X-GhostID-Key"] = API_KEY;
  return headers;
}

async function request(path, options = {}) {
  const start = performance.now();
  const res = await fetch(`${BASE}${path}`, {
    headers: authHeaders(),
    ...options,
    // Merge headers rather than replace
    ...(options.headers
      ? { headers: { ...authHeaders(), ...options.headers } }
      : {}),
  });
  const latency = Math.round(performance.now() - start);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return { data, latency };
}

export const api = {
  enroll: async (userId, features) => {
    const { data } = await request("/enroll", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, features }),
    });
    return data;
  },

  getStatus: async (userId) => {
    const { data } = await request(`/enroll/${encodeURIComponent(userId)}`);
    return data;
  },

  score: async (userId, features) => {
    const { data } = await request("/score", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, features }),
    });
    return data;
  },

  simulateImpostor: async (userId) => {
    const { data } = await request("/score/simulate-impostor", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, features: Array(41).fill(0) }),
    });
    return data;
  },

  deleteProfile: async (userId) => {
    const { data } = await request(`/enroll/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    return data;
  },

  health: async () => {
    const { data, latency } = await request("/health");
    return { ...data, latency };
  },
};
