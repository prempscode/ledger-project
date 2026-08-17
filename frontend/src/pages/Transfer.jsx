import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import Navbar from "../components/Navbar.jsx";

export default function Transfer() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    api
      .getAccounts(token)
      .then((data) => {
        setAccounts(data.accounts || []);
        if (data.accounts?.length) setFromAccount(data.accounts[0]._id);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const data = await api.createTransaction(token, {
        fromAccount,
        toAccount,
        amount: Number(amount),
        idempotencyKey,
      });
      setSuccess(data.transaction);
      setToAccount("");
      setAmount("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="center-page" style={{ paddingTop: 20 }}>
        <div className="card" style={{ width: "100%", maxWidth: 420 }}>
          <h1 className="auth-title" style={{ textAlign: "left" }}>
            Transfer money
          </h1>
          <p className="auth-subtitle" style={{ textAlign: "left" }}>
            Send funds from one of your accounts to any account ID
          </p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && (
            <div className="alert alert-success">
              Sent successfully. Transaction is {success.status.toLowerCase()}.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="fromAccount">From account</label>
              <select
                id="fromAccount"
                className="input"
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                required
              >
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc._id} — ₹{acc.balance ?? 0}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="toAccount">To account ID</label>
              <input
                id="toAccount"
                className="input"
                type="text"
                placeholder="Recipient's account ID"
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                className="input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "Send"}
            </button>
          </form>

          <hr className="divider" />
          <button className="btn btn-secondary" onClick={() => navigate("/")}>
            Back to accounts
          </button>
        </div>
      </div>
    </div>
  );
}
