import React, { useEffect, useState } from "react";
import api from "../../../api/Interceptor";

const Payments = () => {
  const emptyForm = {
    tenantId: "",
    amount: "",
    paymentDate: "",
    paymentMonth: "",
    paymentYear: new Date().getFullYear(),
    paymentMode: "CASH",
    status: "PAID",
    remarks: "",
  };

  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  // ================= LOAD DATA =================
  const load = async () => {
    try {
      setLoading(true);

      const [paymentRes, tenantRes] = await Promise.all([
        api.get("/admin/payments"),
        api.get("/admin/tenants"),
      ]);

      setPayments(
        paymentRes.data.response ||
        paymentRes.data.data ||
        paymentRes.data ||
        []
      );

      setTenants(
        tenantRes.data.response ||
        tenantRes.data.data ||
        tenantRes.data ||
        []
      );
    } catch (error) {
      console.error("Load Error:", error);
      setMsg("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= SAVE PAYMENT =================
  const save = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        amount: Number(form.amount),
        paymentDate: form.paymentDate,
        paymentMonth: form.paymentMonth,
        paymentYear: Number(form.paymentYear),
        paymentMode: form.paymentMode,
        status: form.status,
        remarks: form.remarks,
      };

      await api.post(
        `/admin/payments?tenantId=${form.tenantId}`,
        payload
      );

      setMsg("Payment recorded successfully");
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (error) {
      console.error("Save Error:", error);

      setMsg(
        error?.response?.data?.message ||
        "Unable to save payment"
      );
    }

    setTimeout(() => setMsg(""), 3000);
  };

  // ================= DELETE =================
  const remove = async (id) => {
    try {
      await api.delete(`/admin/payments/${id}`);
      setMsg("Payment deleted");
      load();
    } catch (error) {
      setMsg("Delete failed");
    }

    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <h2>Payment Management</h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Payment"}
        </button>
      </div>

      {/* MESSAGE */}
      {msg && <div className="alert alert-success">{msg}</div>}

      {/* FORM */}
      {showForm && (
        <div className="form-card">
          <h3 style={{ marginBottom: "1rem" }}>
            Record Payment
          </h3>

          <form onSubmit={save}>
            <div className="form-grid">

              <div className="form-group">
                <label>Tenant *</label>
                <select
                  name="tenantId"
                  value={form.tenantId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Tenant</option>

                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.pgNumber} - {t.studentName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={form.paymentDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Month *</label>
                <select
                  name="paymentMonth"
                  value={form.paymentMonth}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Month</option>

                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Year *</label>
                <input
                  type="number"
                  name="paymentYear"
                  value={form.paymentYear}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Mode</label>
                <select
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleChange}
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">
                    Bank Transfer
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              <div className="form-group">
                <label>Remarks</label>
                <input
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ marginTop: "12px" }}
            >
              Save Payment
            </button>
          </form>
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
              <th>Tenant</th>
              <th>Amount</th>
              <th>Month</th>
              <th>Date</th>
              <th>Mode</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.tenantPgNumber} - {p.tenantName}
                </td>

                <td>
                  <strong>₹{p.amount}</strong>
                </td>

                <td>
                  {p.paymentMonth} {p.paymentYear}
                </td>

                <td>{p.paymentDate}</td>

                <td>{p.paymentMode}</td>

                <td>
                  <span
                    className={`badge ${
                      p.status === "PAID"
                        ? "badge-success"
                        : "badge-warning"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => remove(p.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {payments.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    color: "#94a3b8",
                    padding: "20px",
                  }}
                >
                  {loading
                    ? "Loading payments..."
                    : "No payments found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;