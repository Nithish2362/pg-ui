import React, { useState, useEffect } from 'react';
import api from '../api';

const Floors = () => {
  const [floors, setFloors] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [form, setForm] = useState({ floorNumber: '', floorName: '', buildingId: '' });
  const [msg, setMsg] = useState('');

  const load = () => {
    api.get('/admin/floors').then(r => setFloors(r.data.response || r.data.data || r.data));
    api.get('/admin/buildings').then(r => setBuildings(r.data.response || r.data.data || r.data));
  };
  
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api.post(`/admin/floors?buildingId=${form.buildingId}`, form);
    setForm({ floorNumber: '', floorName: '', buildingId: '' }); 
    setMsg('Floor created!'); 
    load();
    setTimeout(() => setMsg(''), 2000);
  };

  const del = async (id) => { 
    await api.delete(`/admin/floors/${id}`); 
    load(); 
  };

  return (
    <div>
      <div className="page-header"><h2>Floor Management</h2></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="form-card">
        <h3 style={{ marginBottom: '1rem' }}>Add Floor</h3>
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group">
              <label>Building</label>
              <select value={form.buildingId} onChange={e => setForm({ ...form, buildingId: e.target.value })} required>
                <option value="">Select Building</option>
                {buildings.map(b => <option key={b.id} value={b.id}>{b.buildingName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Floor Number</label>
              <input type="number" value={form.floorNumber} onChange={e => setForm({ ...form, floorNumber: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Floor Name</label>
              <input value={form.floorName} onChange={e => setForm({ ...form, floorName: e.target.value })} required placeholder="e.g. Ground Floor" />
            </div>
          </div>
          <button className="btn btn-primary">Save Floor</button>
        </form>
      </div>
      <div className="data-card">
        <div className="data-card-header"><h3>All Floors</h3></div>
        <table>
          <thead><tr><th>Floor #</th><th>Name</th><th>Building</th><th>Rooms</th><th>Actions</th></tr></thead>
          <tbody>
            {floors.map(f => (
              <tr key={f.id}>
                <td>{f.floorNumber}</td>
                <td>{f.floorName}</td>
                <td>{f.buildingId}</td>
                <td>{f.rooms?.length || 0}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => del(f.id)}>Delete</button></td>
              </tr>
            ))}
            {floors.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>No floors yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Floors;
