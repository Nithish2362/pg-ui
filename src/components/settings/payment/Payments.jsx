import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import api from "../../../api/Interceptor";

// ============================================================
// PaymentReceipt – printable component (ref forwarded)
// ============================================================
const PaymentReceipt = React.forwardRef(({ receipt }, ref) => {
  if (!receipt) return null;
  return (
    <div
      ref={ref}
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        padding: "40px",
        width: "700px",
        color: "#1e293b",
        background: "#fff",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", color: "#6366f1" }}>🏠 PG Hostel</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>Payment Receipt</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Receipt #</p>
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px" }}>PMT-{receipt.id}</p>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>{receipt.paymentDate}</p>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "2px solid #e2e8f0", marginBottom: "24px" }} />

      {/* Tenant Details */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>Tenant Details</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {[
              ["Tenant Name", receipt.tenantName],
              ["PG Number", receipt.tenantPgNumber],
              ["Payment Month", `${receipt.paymentMonth} ${receipt.paymentYear}`],
            ].map(([label, value]) => (
              <tr key={label}>
                <td style={{ padding: "6px 0", color: "#64748b", width: "40%" }}>{label}</td>
                <td style={{ padding: "6px 0", fontWeight: 500 }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Details */}
      <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>Payment Details</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {[
              ["Amount Paid", `₹${receipt.amount}`],
              ["Payment Mode", receipt.paymentMode],
              ["Status", receipt.status],
              ["Remarks", receipt.remarks || "—"],
            ].map(([label, value]) => (
              <tr key={label}>
                <td style={{ padding: "6px 0", color: "#64748b", width: "40%" }}>{label}</td>
                <td style={{ padding: "6px 0", fontWeight: label === "Amount Paid" ? "bold" : 500, fontSize: label === "Amount Paid" ? "18px" : "14px", color: label === "Amount Paid" ? "#6366f1" : "#1e293b" }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr style={{ border: "none", borderTop: "1px dashed #e2e8f0", margin: "24px 0" }} />
      <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px", margin: 0 }}>Thank you for your payment! 🙏</p>
    </div>
  );
});

// ============================================================
// Main Payments Component
// ============================================================
const STATUS_CONFIG = {
  PAID:            { bg: "#dcfce7", color: "#16a34a", label: "PAID" },
  "PARTIALLY PAID":{ bg: "#fef9c3", color: "#ca8a04", label: "PARTIALLY PAID" },
  PENDING:         { bg: "#fce7f3", color: "#db2777", label: "PENDING" },
  "NOT PAID":      { bg: "#fee2e2", color: "#dc2626", label: "NOT PAID" },
};

const Payments = () => {
  const emptyForm = {
    tenantId: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMonth: new Date().toLocaleString("default", { month: "long" }),
    paymentYear: new Date().getFullYear(),
    paymentMode: "CASH",
    remarks: "",
  };

  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTenantRent, setSelectedTenantRent] = useState(null);
  const receiptRef = useRef();

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const printReceipt = useReactToPrint({ contentRef: receiptRef });

  const load = async () => {
    try {
      setLoading(true);
      const [paymentRes, tenantRes] = await Promise.all([
        api.get("/admin/payments"),
        api.get("/admin/tenants"),
      ]);
      setPayments(paymentRes.data?.response || paymentRes.data?.data || paymentRes.data || []);
      setTenants(tenantRes.data?.response || tenantRes.data?.data || tenantRes.data || []);
    } catch (err) {
      showMsg("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  // When tenant is selected, auto-fill the rent info
  const handleTenantChange = (e) => {
    const id = e.target.value;
    setForm({ ...form, tenantId: id });
    const tenant = tenants.find(t => String(t.id) === String(id));
    setSelectedTenantRent(tenant?.monthlyRent || null);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        amount: Number(form.amount),
        paymentDate: form.paymentDate,
        paymentMonth: form.paymentMonth,
        paymentYear: Number(form.paymentYear),
        paymentMode: form.paymentMode,
        remarks: form.remarks,
      };
      const res = await api.post(`/admin/payments?tenantId=${form.tenantId}`, payload);
      const saved = res.data?.response || res.data;
      showMsg("✅ Payment recorded successfully");
      setShowForm(false);
      setForm(emptyForm);
      setSelectedTenantRent(null);
      // Show receipt immediately
      setSelectedReceipt(saved);
      setShowReceipt(true);
      load();
    } catch (err) {
      showMsg(err?.response?.data?.message || "❌ Unable to save payment", "error");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this payment?")) return;
    try {
      await api.delete(`/admin/payments/${id}`);
      showMsg("Payment deleted");
      load();
    } catch {
      showMsg("Delete failed", "error");
    }
  };

  const openReceipt = (p) => {
    setSelectedReceipt(p);
    setShowReceipt(true);
  };

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <h2>💳 Payment Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "+ Record Payment"}
        </button>
      </div>

      {/* MESSAGE */}
      {msg.text && (
        <div className={`alert ${msg.type === "error" ? "alert-error" : "alert-success"}`}>
          {msg.text}
        </div>
      )}

      {/* FORM */}
      {showForm && (
        <div className="form-card">
          <h3 style={{ marginBottom: "1rem" }}>Record Payment</h3>
          {selectedTenantRent && (
            <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🏠</span>
              <span>Room Monthly Rent: <strong style={{ color: "#6366f1", fontSize: "18px" }}>₹{selectedTenantRent}</strong></span>
            </div>
          )}
          <form onSubmit={save}>
            <div className="form-grid">
              <div className="form-group">
                <label>Tenant *</label>
                <select name="tenantId" value={form.tenantId} onChange={handleTenantChange} required>
                  <option value="">Select Tenant</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.pgNumber} – {t.studentName} {t.monthlyRent ? `(₹${t.monthlyRent}/mo)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount Paid (₹) *</label>
                <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder={selectedTenantRent ? `Full rent: ₹${selectedTenantRent}` : "Enter amount"} required min="1" />
                {selectedTenantRent && form.amount && Number(form.amount) > 0 && (
                  <small style={{ color: Number(form.amount) >= selectedTenantRent ? "#16a34a" : "#ca8a04", fontWeight: 600, marginTop: "4px", display: "block" }}>
                    → Status will be: {Number(form.amount) >= selectedTenantRent ? "✅ PAID" : "⚠️ PARTIALLY PAID"}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Payment Date *</label>
                <input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Month *</label>
                <select name="paymentMonth" value={form.paymentMonth} onChange={handleChange} required>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Year *</label>
                <input type="number" name="paymentYear" value={form.paymentYear} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Payment Mode *</label>
                <select name="paymentMode" value={form.paymentMode} onChange={handleChange}>
                  <option value="CASH">💵 Cash</option>
                  <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
                  <option value="UPI">📱 UPI</option>
                  <option value="CHEQUE">📄 Cheque</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Remarks</label>
                <input name="remarks" value={form.remarks} onChange={handleChange} placeholder="Optional notes..." />
              </div>
            </div>

            <button className="btn btn-primary" style={{ marginTop: "12px" }}>
              Save & Generate Receipt
            </button>
          </form>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {showReceipt && selectedReceipt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "16px", overflow: "auto", maxHeight: "90vh", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}>
            <PaymentReceipt ref={receiptRef} receipt={selectedReceipt} />
            <div style={{ display: "flex", gap: "12px", padding: "16px 40px 24px", justifyContent: "flex-end", background: "#f8fafc" }}>
              <button className="btn btn-secondary" onClick={() => setShowReceipt(false)}>Close</button>
              <button className="btn btn-primary" onClick={printReceipt}>🖨️ Print Receipt</button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="data-card">
        <div className="data-card-header">
          <h3>All Payments ({payments.length})</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tenant</th>
              <th>Amount</th>
              <th>Month / Year</th>
              <th>Date</th>
              <th>Mode</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => {
              const cfg = STATUS_CONFIG[p.status] || { bg: "#f1f5f9", color: "#64748b", label: p.status };
              return (
                <tr key={p.id}>
                  <td style={{ color: "#94a3b8", fontSize: "12px" }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.tenantName}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{p.tenantPgNumber}</div>
                  </td>
                  <td><strong style={{ color: "#6366f1", fontSize: "16px" }}>₹{p.amount}</strong></td>
                  <td>{p.paymentMonth} {p.paymentYear}</td>
                  <td style={{ fontSize: "13px" }}>{p.paymentDate}</td>
                  <td>
                    <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                      {p.paymentMode === "CASH" ? "💵" : p.paymentMode === "BANK_TRANSFER" ? "🏦" : p.paymentMode === "UPI" ? "📱" : "📄"} {p.paymentMode}
                    </span>
                  </td>
                  <td>
                    <span style={{ background: cfg.bg, color: cfg.color, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                      {cfg.label}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: "6px" }}>
                    <button className="btn btn-sm" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.3)" }} onClick={() => openReceipt(p)}>
                      🖨️ Receipt
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {payments.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: "center", color: "#94a3b8", padding: "30px" }}>
                {loading ? "Loading payments..." : "No payments found"}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;