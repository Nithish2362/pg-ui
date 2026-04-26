import React, { useState, useEffect } from 'react';
import api from '../../api/Interceptor';

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    studentName: '', mobileNumber: '', fatherName: '', fatherMobile: '',
    motherName: '', motherMobile: '', email: '', dob: '', address: '',
    roomId: '', bedId: ''
  });

  const load = () => {
    api.get('/admin/tenants').then(r => setTenants(r.data.response || r.data.data || r.data));
    api.get('/admin/rooms').then(r => setRooms(r.data.response || r.data.data || r.data));
  };
  useEffect(() => { load(); }, []);

  const loadBeds = async (roomId) => {
    setForm(f => ({ ...f, roomId, bedId: '' }));
    const res = await api.get(`/admin/beds/room/${roomId}/available`);
    setBeds(res.data.response || res.data.data || []);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const { roomId, bedId, ...tenantData } = form;
      const res = await api.post(`/admin/tenants?bedId=${bedId}`, tenantData);
      const createdTenant = res.data.response || res.data.data || {};
      setMsg(`Tenant created! PG Number: ${createdTenant.pgNumber} | Default password: pg@${tenantData.mobileNumber}`);
      setShowForm(false); setForm({ studentName: '', mobileNumber: '', fatherName: '', fatherMobile: '', motherName: '', motherMobile: '', email: '', dob: '', address: '', roomId: '', bedId: '' });
      load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error creating tenant'); }
  };

  const deactivate = async (id) => { await api.put(`/admin/tenants/${id}/deactivate`); load(); };

  return (
    <div>
      <div className="page-header">
        <h2>Tenant Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Tenant'}</button>
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}

      {showForm && (
        <div className="form-card">
          <h3 style={{ marginBottom: '1rem' }}>Register New Tenant</h3>
          <form onSubmit={save}>
            <div className="form-grid">
              <div className="form-group"><label>Student Name *</label><input value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} required /></div>
              <div className="form-group"><label>Mobile Number *</label><input value={form.mobileNumber} onChange={e => setForm({ ...form, mobileNumber: e.target.value })} required /></div>
              <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="form-group"><label>Date of Birth</label><input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} /></div>
              <div className="form-group"><label>Father Name</label><input value={form.fatherName} onChange={e => setForm({ ...form, fatherName: e.target.value })} /></div>
              <div className="form-group"><label>Father Mobile</label><input value={form.fatherMobile} onChange={e => setForm({ ...form, fatherMobile: e.target.value })} /></div>
              <div className="form-group"><label>Mother Name</label><input value={form.motherName} onChange={e => setForm({ ...form, motherName: e.target.value })} /></div>
              <div className="form-group"><label>Mother Mobile</label><input value={form.motherMobile} onChange={e => setForm({ ...form, motherMobile: e.target.value })} /></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Address</label><textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows="2" /></div>
              <div className="form-group">
                <label>Select Room *</label>
                <select value={form.roomId} onChange={e => loadBeds(e.target.value)} required>
                  <option value="">Choose Room</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.roomNumber} - {r.roomType} ({r.sharingType} Sharing) - ₹{r.monthlyRent}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Select Bed *</label>
                <select value={form.bedId} onChange={e => setForm({ ...form, bedId: e.target.value })} required>
                  <option value="">Choose Bed</option>
                  {beds?.map(b => <option key={b.id} value={b.id}>{b.bedNumber}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Register Tenant</button>
          </form>
        </div>
      )}

      <div className="data-card">
        <div className="data-card-header"><h3>All Tenants</h3></div>
        <table>
          <thead><tr><th>PG No</th><th>Name</th><th>Mobile</th><th>Email</th><th>Room</th><th>Bed</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {tenants.map(t => (
              <tr key={t.id}>
                <td><strong>{t.pgNumber}</strong></td>
                <td>{t.studentName}</td>
                <td>{t.mobileNumber}</td>
                <td>{t.email}</td>
                <td>{t.bed?.room?.roomNumber || '-'}</td>
                <td>{t.bed?.bedNumber || '-'}</td>
                <td><span className={`badge ${t.isActive ? 'badge-success' : 'badge-danger'}`}>{t.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>{t.isActive && <button className="btn btn-danger btn-sm" onClick={() => deactivate(t.id)}>Deactivate</button>}</td>
              </tr>
            ))}
            {tenants.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', color: '#94a3b8' }}>No tenants yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tenants;
