import React, { useState, useEffect } from 'react';
import api from '../api';

const Buildings = () => {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({ buildingName: '', locationId: '' });
  const [msg, setMsg] = useState('');

  const load = () => {
    api.get('/admin/buildings').then(r => setItems(r.data.response || r.data.data || r.data));
    api.get('/admin/locations').then(r => setLocations(r.data.response || r.data.data || r.data));
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api.post(`/admin/buildings?locationId=${form.locationId}`, { buildingName: form.buildingName });
    setForm({ buildingName: '', locationId: '' }); setMsg('Building created!'); load();
    setTimeout(() => setMsg(''), 2000);
  };

  const del = async (id) => { await api.delete(`/admin/buildings/${id}`); load(); };

  return (
    <div>
      <div className="page-header"><h2>Building Management</h2></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="form-card">
        <h3 style={{ marginBottom: '1rem' }}>Add Building</h3>
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group">
              <label>Location</label>
              <select value={form.locationId} onChange={e => setForm({ ...form, locationId: e.target.value })} required>
                <option value="">Select Location</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.locationName}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Building Name</label><input value={form.buildingName} onChange={e => setForm({ ...form, buildingName: e.target.value })} required /></div>
          </div>
          <button className="btn btn-primary">Save Building</button>
        </form>
      </div>
      <div className="data-card">
        <div className="data-card-header"><h3>All Buildings</h3></div>
        <table>
          <thead><tr><th>Name</th><th>Location</th><th>Floors</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(b => (
              <tr key={b.id}>
                <td><strong>{b.buildingName}</strong></td><td>{b.locationId}</td>
                <td>{b.floors?.length || 0}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => del(b.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>No buildings yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Buildings;
