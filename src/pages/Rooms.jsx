import React, { useState, useEffect } from 'react';
import api from '../api';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [form, setForm] = useState({ roomNumber: '', roomType: 'AC', sharingType: 2, monthlyRent: '', totalBeds: '', floorId: '' });
  const [msg, setMsg] = useState('');

  const load = () => {
    api.get('/admin/rooms').then(r => setRooms(r.data.response || r.data.data || r.data));
    api.get('/admin/floors').then(r => setFloors(r.data.response || r.data.data || r.data));
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api.post(`/admin/rooms?floorId=${form.floorId}`, {
      roomNumber: form.roomNumber, roomType: form.roomType,
      sharingType: parseInt(form.sharingType), monthlyRent: parseFloat(form.monthlyRent),
      totalBeds: parseInt(form.totalBeds),
    });
    setForm({ roomNumber: '', roomType: 'AC', sharingType: 2, monthlyRent: '', totalBeds: '', floorId: '' });
    setMsg('Room created with beds!'); load();
    setTimeout(() => setMsg(''), 2000);
  };

  const del = async (id) => { await api.delete(`/admin/rooms/${id}`); load(); };

  return (
    <div>
      <div className="page-header"><h2>Room Management</h2></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="form-card">
        <h3 style={{ marginBottom: '1rem' }}>Add Room</h3>
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group">
              <label>Floor</label>
              <select value={form.floorId} onChange={e => setForm({ ...form, floorId: e.target.value })} required>
                <option value="">Select Floor</option>
                {floors.map(f => <option key={f.id} value={f.id}>{f.floorName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Room Number</label>
              <input value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} required placeholder="e.g. 101" />
            </div>
            <div className="form-group">
              <label>Room Type</label>
              <select value={form.roomType} onChange={e => setForm({ ...form, roomType: e.target.value })}>
                <option value="AC">AC</option>
                <option value="NON_AC">Non-AC</option>
              </select>
            </div>
            <div className="form-group">
              <label>Sharing Type</label>
              <select value={form.sharingType} onChange={e => setForm({ ...form, sharingType: e.target.value })}>
                <option value="2">2 Sharing</option>
                <option value="5">5 Sharing</option>
              </select>
            </div>
            <div className="form-group">
              <label>Monthly Rent (₹)</label>
              <input type="number" value={form.monthlyRent} onChange={e => setForm({ ...form, monthlyRent: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Total Beds</label>
              <input type="number" value={form.totalBeds} onChange={e => setForm({ ...form, totalBeds: e.target.value })} required />
            </div>
          </div>
          <button className="btn btn-primary">Save Room</button>
        </form>
      </div>
      <div className="data-card">
        <div className="data-card-header"><h3>All Rooms</h3></div>
        <table>
          <thead><tr><th>Room</th><th>Floor</th><th>Type</th><th>Sharing</th><th>Rent</th><th>Beds</th><th>Actions</th></tr></thead>
          <tbody>
            {rooms.map(r => (
              <tr key={r.id}>
                <td><strong>{r.roomNumber}</strong></td>
                <td>{r.floor?.floorName || r.floorId}</td>
                <td><span className={`badge ${r.roomType === 'AC' ? 'badge-info' : 'badge-warning'}`}>{r.roomType}</span></td>
                <td>{r.sharingType} Sharing</td>
                <td>₹{r.monthlyRent}</td>
                <td>{r.beds?.length || r.totalBeds}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => del(r.id)}>Delete</button></td>
              </tr>
            ))}
            {rooms.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8' }}>No rooms yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Rooms;
