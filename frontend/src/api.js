const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  register: (name, email, password) =>
    request("/auth/register", {
      method: "POST",
      body: { name, email, password },
    }),

  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),

  logout: (token) => request("/auth/logout", { method: "POST", token }),

  getAccounts: (token) => request("/accounts", { token }),

  createAccount: (token) => request("/accounts", { method: "POST", token }),

  getBalance: (accountId, token) =>
    request(`/accounts/balance/${accountId}`, { token }),

  createTransaction: (
    token,
    { fromAccount, toAccount, amount, idempotencyKey },
  ) =>
    request("/transactions", {
      method: "POST",
      token,
      body: { fromAccount, toAccount, amount, idempotencyKey },
    }),
};
