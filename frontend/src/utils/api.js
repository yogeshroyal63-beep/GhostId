const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const start = performance.now();
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
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
