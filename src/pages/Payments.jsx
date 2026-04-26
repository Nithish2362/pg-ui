import React, { useState, useEffect } from 'react';
import api from '../api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ tenantId: '', amount: '', paymentDate: '', paymentMonth: '', paymentYear: '', paymentMode: 'CASH', status: 'PAID', remarks: '' });

  const load = () => {
    api.get('/admin/payments').then(r => setPayments(r.data.response || r.data.data || r.data));
    api.get('/admin/tenants').then(r => setTenants(r.data.response || r.data.data || r.data));
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    const { tenantId, ...paymentData } = form;
    paymentData.paymentYear = parseInt(paymentData.paymentYear);
    paymentData.amount = parseFloat(paymentData.amount);
    await api.post(`/admin/payments?tenantId=${tenantId}`, paymentData);
    setMsg('Payment recorded!'); setShowForm(false);
    setForm({ tenantId: '', amount: '', paymentDate: '', paymentMonth: '', paymentYear: '', paymentMode: 'CASH', status: 'PAID', remarks: '' });
    load(); setTimeout(() => setMsg(''), 3000);
  };

  const del = async (id) => { await api.delete(`/admin/payments/${id}`); load(); };

  return (
    <div>
      <div className="page-header">
        <h2>Payment Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Payment'}</button>
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}

      {showForm && (
        <div className="form-card">
          <h3 style={{ marginBottom: '1rem' }}>Record Payment</h3>
          <form onSubmit={save}>
            <div className="form-grid">
              <div className="form-group">
                <label>Tenant *</label>
                <select value={form.tenantId} onChange={e => setForm({ ...form, tenantId: e.target.value })} required>
                  <option value="">Select Tenant</option>
                  {tenants.filter(t => t.isActive).map(t => <option key={t.id} value={t.id}>{t.pgNumber} - {t.studentName}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Amount (₹) *</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
              <div className="form-group"><label>Payment Date *</label><input type="date" value={form.paymentDate} onChange={e => setForm({ ...form, paymentDate: e.target.value })} required /></div>
              <div className="form-group">
                <label>Month *</label>
                <select value={form.paymentMonth} onChange={e => setForm({ ...form, paymentMonth: e.target.value })} required>
                  <option value="">Select Month</option>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Year *</label><input type="number" value={form.paymentYear} onChange={e => setForm({ ...form, paymentYear: e.target.value })} required placeholder="2026" /></div>
              <div className="form-group">
                <label>Mode</label>
                <select value={form.paymentMode} onChange={e => setForm({ ...form, paymentMode: e.target.value })}>
                  <option value="CASH">Cash</option><option value="UPI">UPI</option><option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="PAID">Paid</option><option value="PENDING">Pending</option>
                </select>
              </div>
              <div className="form-group"><label>Remarks</label><input value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} /></div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Save Payment</button>
          </form>
        </div>
      )}

      <div className="data-card">
        <div className="data-card-header"><h3>All Payments</h3></div>
        <table>
          <thead><tr><th>Tenant</th><th>Amount</th><th>Month</th><th>Date</th><th>Mode</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <td>{p.tenant?.pgNumber || p.tenantId}</td>
                <td><strong>₹{p.amount}</strong></td>
                <td>{p.paymentMonth} {p.paymentYear}</td>
                <td>{p.paymentDate}</td>
                <td>{p.paymentMode}</td>
                <td><span className={`badge ${p.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>{p.status}</span></td>
                <td><button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>Delete</button></td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8' }}>No payments yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
