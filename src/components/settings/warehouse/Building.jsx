import React, { useState, useEffect } from 'react';
import api from '../../../api/Interceptor';

const Buildings = () => {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);

  const [form, setForm] = useState({
    buildingName: '',
    locationId: '',
  });
console.log(form,"from")
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');

  // Load Data
  const load = async () => {
    try {
      const buildingRes = await api.get('/admin/buildings');
      const locationRes = await api.get('/admin/locations');

      setItems(
        buildingRes.data.response ||
          buildingRes.data.data ||
          buildingRes.data ||
          []
      );

      setLocations(
        locationRes.data.response ||
          locationRes.data.data ||
          locationRes.data ||
          []
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Save / Update
  const save = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/admin/buildings/${editingId}`, {
          buildingName: form.buildingName,
        });

        setMsg('Building updated successfully!');
      } else {
        await api.post(
          `/admin/buildings?locationId=${form.locationId}`,
          {
            buildingName: form.buildingName,
          }
        );

        setMsg('Building created successfully!');
      }

      setForm({
        buildingName: '',
        locationId: '',
      });

      setEditingId(null);
      load();

      setTimeout(() => setMsg(''), 2500);
    } catch (error) {
      console.error(error);
    }
  };

  // Edit
  const edit = (item) => {
    setForm({
      buildingName: item.buildingName || '',
      locationId: item.locationId || '',
    });

    setEditingId(item.id);
  };

  // Delete
  const del = async (id) => {
    try {
      await api.delete(`/admin/buildings/${id}`);
      setMsg('Building deleted successfully!');
      load();

      setTimeout(() => setMsg(''), 2500);
    } catch (error) {
      console.error(error);
    }
  };

  // Cancel Edit
  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      buildingName: '',
      locationId: '',
    });
  };

  // Get Location Name
  const getLocationName = (id) => {
    const loc = locations.find((x) => x.id === id);
    return loc ? loc.locationName : id;
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h2>Building Management</h2>
      </div>

      {/* Message */}
      {msg && <div className="alert alert-success">{msg}</div>}

      {/* Form */}
      <div className="form-card">
        <h3 style={{ marginBottom: '1rem' }}>
          {editingId ? 'Edit Building' : 'Add Building'}
        </h3>

        <form onSubmit={save}>
          <div className="form-grid">

            {/* Location */}
            <div className="form-group">
              <label>Location</label>
              <select
                value={form.locationId}
                onChange={(e) =>
                  setForm({ ...form, locationId: e.target.value })
                }
                required
                disabled={editingId}
              >
                <option value="">Select Location</option>

                {locations.map((loc) => (
                  <option key={loc.id} value={loc.locationId}>
                    {loc.locationName}
                  </option>
                ))}
              </select>
            </div>

            {/* Building Name */}
            <div className="form-group">
              <label>Building Name</label>
              <input
                type="text"
                value={form.buildingName}
                onChange={(e) =>
                  setForm({ ...form, buildingName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary">
              {editingId ? 'Update Building' : 'Save Building'}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="data-card">
        <div className="data-card-header">
          <h3>All Buildings</h3>
        </div>

        <table>
          <thead>
            <tr>
              <th>Building Name</th>
              <th>Location</th>
              <th>Floors</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.length > 0 ? (
              items.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.buildingName}</strong>
                  </td>

                  <td>{getLocationName(b.locationId)}</td>

                  <td>{b.floors?.length || 0}</td>

                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => edit(b)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => del(b.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: 'center',
                    color: '#94a3b8',
                    padding: '20px',
                  }}
                >
                  No buildings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Buildings;