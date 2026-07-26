import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import Navbar from "../components/Navbar.jsx";

function formatBalance(value, currency) {
  const amount = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
  return currency === "INR" ? `₹${amount}` : `${amount} ${currency ?? ""}`;
}

function shortId(id) {
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

export default function Dashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState("");

  const loadAccounts = useCallback(async () => {
    setError("");
    try {
      const data = await api.getAccounts(token);
      setAccounts(data.accounts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  async function handleCreateAccount() {
    setCreating(true);
    setError("");
    try {
      await api.createAccount(token);
      await loadAccounts();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function handleCopy(id) {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 1200);
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ maxWidth: 900, paddingBottom: 60 }}>
        <div className="section-header">
          <h1 className="section-title">Your accounts</h1>
          {accounts.length > 0 && (
            <button
              className="btn btn-primary btn-block-auto"
              onClick={() => navigate("/transfer")}
            >
              Transfer money
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="empty-state">
            <span className="spinner spinner-dark" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-title">No accounts yet</div>
            <p style={{ marginBottom: 20 }}>
              Create your first account to start sending and receiving money.
              <br />
              (You will get account creating bonus 5000 inr)
            </p>
            <button
              className="btn btn-primary btn-block-auto"
              style={{ margin: "0 auto" }}
              onClick={handleCreateAccount}
              disabled={creating}
            >
              {creating ? <span className="spinner" /> : "Create account"}
            </button>
          </div>
        ) : (
          <div className="account-grid">
            {accounts.map((acc) => (
              <div
                key={acc._id}
                className="account-card"
                onClick={() => handleCopy(acc._id)}
                title="Click to copy account ID"
              >
                <div className="account-card-label">
                  {copiedId === acc._id ? "Copied ✓" : shortId(acc._id)}
                </div>
                <div className="account-card-balance">
                  {formatBalance(acc.balance, acc.currency)}
                </div>
                <span
                  className={`status-pill ${
                    acc.status === "ACTIVE" ? "status-active" : "status-other"
                  }`}
                >
                  {acc.status}
                </span>
              </div>
            ))}

            <button
              className="new-account-card"
              onClick={handleCreateAccount}
              disabled={creating}
            >
              {creating ? (
                <span className="spinner spinner-dark" />
              ) : (
                "+ New account"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
