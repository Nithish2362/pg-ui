import React, { useState, useEffect } from 'react';
import api from '../api';

const Locations = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ locationName: '', address: '', city: '' });
  const [msg, setMsg] = useState('');

  const load = () => api.get('/admin/locations').then(r => setItems(r.data.response || r.data.data || r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api.post('/admin/locations', form);
    setForm({ locationName: '', address: '', city: '' }); setMsg('Location created!'); load();
    setTimeout(() => setMsg(''), 2000);
  };

  const del = async (id) => { await api.delete(`/admin/locations/${id}`); load(); };

  return (
    <div>
      <div className="page-header"><h2>Location Management</h2></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="form-card">
        <h3 style={{ marginBottom: '1rem' }}>Add Location</h3>
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group"><label>Location Name</label><input value={form.locationName} onChange={e => setForm({ ...form, locationName: e.target.value })} required /></div>
            <div className="form-group"><label>City</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
            <div className="form-group"><label>Address</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
          </div>
          <button className="btn btn-primary">Save Location</button>
        </form>
      </div>
      <div className="data-card">
        <div className="data-card-header"><h3>All Locations</h3></div>
        <table>
          <thead><tr><th>Name</th><th>City</th><th>Address</th><th>Buildings</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(l => (
              <tr key={l.id}>
                <td><strong>{l.locationName}</strong></td><td>{l.city || '-'}</td><td>{l.address || '-'}</td>
                <td>{l.buildings?.length || 0}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => del(l.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>No locations yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Locations;
