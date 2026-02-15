// frontend/src/services/api.js

const BASE_URL = "http://localhost:5000";

/* ================= DASHBOARD ================= */

export async function getStats() {
  const res = await fetch(`${BASE_URL}/api/manufacturer/stats`);
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

export async function getActivity() {
  const res = await fetch(`${BASE_URL}/api/manufacturer/activity`);
  if (!res.ok) throw new Error("Failed to load activity");
  return res.json();
}

export async function getBatches() {
  const res = await fetch(`${BASE_URL}/api/manufacturer/batches`);
  if (!res.ok) throw new Error("Failed to load batches");
  return res.json();
}

/* ================= REGISTER BATCH (DB) ================= */

export async function registerBatch(data) {
  const res = await fetch(`${BASE_URL}/api/manufacturer/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (!res.ok) throw new Error(result.message || "Registration failed");

  return result;
}

/* ================= SHIP ================= */

export async function shipBatch(data) {
  const res = await fetch(`${BASE_URL}/api/manufacturer/ship`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (!res.ok) throw new Error(result.message || "Shipping failed");

  return result;
}

/* ================= USER VERIFICATION ================= */

// 🔐 Request NFC challenge
export async function requestChallenge(productId) {
  const res = await fetch(`${BASE_URL}/api/request-challenge/${productId}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to request challenge");
  }

  return res.json();
}

// ✅ Verify NFC signed response
export async function verifyResponse(productId, response) {
  const res = await fetch(`${BASE_URL}/api/verify-response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, response })
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Verification failed");
  }

  return result;
}
