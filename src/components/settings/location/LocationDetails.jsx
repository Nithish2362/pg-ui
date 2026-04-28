import React, { useState, useEffect } from "react";
import { Modal, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import api from "../../../api/Interceptor";
import indiaLocations from "./StatesAndDistricts.json";
import notify from "../utils/Notification";

const Locations = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);

  const [form, setForm] = useState({
    country: "India",
    state: "",
    city: "",
    locationName: "",
    locationNumber: "",
    address: "",
  });

  const states = Object.keys(indiaLocations);
  const cities = form.state ? indiaLocations[form.state] : [];

  const load = async () => {
    try {
      const res = await api.get("/admin/locations");
      setItems(res.data.response || res.data.data || res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const isFormValid =
    form.state.trim() &&
    form.city.trim() &&
    form.locationName.trim() &&
    form.address.trim();

  const save = async (e) => {
    e.preventDefault();

    try {
      await api.post("/admin/locations", form);

      notify({
        title: "Success!",
        message: "Location created successfully.",
        success: true,
        error: false,
      });

      setForm({
        country: "India",
        state: "",
        city: "",
        locationName: "",
        locationNumber: "",
        address: "",
      });

      load();
    } catch (error) {
      notify({
        title: "Error!",
        message: "Something went wrong while saving location.",
        success: false,
        error: true,
      });
    }
  };

  const openDeleteModal = (location) => {
    setSelectedLocation(location);
    open();
  };

  const closeDeleteModal = () => {
    setSelectedLocation(null);
    close();
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/locations/${selectedLocation.id}`);

      notify({
        title: "Deleted!",
        message: "Location deleted successfully.",
        success: true,
        error: false,
      });

      closeDeleteModal();
      load();
    } catch (error) {
      notify({
        title: "Error!",
        message: "Unable to delete location.",
        success: false,
        error: true,
      });
    }
  };

  const filteredItems = items.filter((l) => {
    const text = search.toLowerCase();

    return (
      l.country?.toLowerCase().includes(text) ||
      l.state?.toLowerCase().includes(text) ||
      l.city?.toLowerCase().includes(text) ||
      l.locationName?.toLowerCase().includes(text) ||
      l.address?.toLowerCase().includes(text)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h2>Location Management</h2>
      </div>

      {/* Form */}
      <div className="form-card">
        <h3 style={{ marginBottom: "15px" }}>Add Location</h3>

        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group">
              <label>Country</label>
              <input value="India" disabled />
            </div>

            <div className="form-group">
              <label>State</label>
              <select
                value={form.state}
                onChange={(e) =>
                  setForm({
                    ...form,
                    state: e.target.value,
                    city: "",
                  })
                }
              >
                <option value="">Select State</option>

                {states.map((state, i) => (
                  <option key={i} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>District / City</label>
              <select
                value={form.city}
                onChange={(e) =>
                  setForm({
                    ...form,
                    city: e.target.value,
                  })
                }
              >
                <option value="">Select City</option>

                {cities.map((city, i) => (
                  <option key={i} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Location Name</label>
              <input
                value={form.locationName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    locationName: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Location Number</label>
              <input
                value={form.locationNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    locationNumber: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                placeholder="Full Address"
                value={form.address}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <button
            className="btn btn-primary"
            disabled={!isFormValid}
            style={{
              marginTop: "15px",
              opacity: !isFormValid ? 0.6 : 1,
              cursor: !isFormValid ? "not-allowed" : "pointer",
            }}
          >
            Save Location
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="data-card">
        <div className="data-card-header">
          <h3>All Locations</h3>

          <input
            type="text"
            placeholder="Search location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "250px",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
            }}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Country</th>
              <th>State</th>
              <th>City</th>
              <th>Location</th>
              <th>Address</th>
              <th>Buildings</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((l) => (
              <tr key={l.id}>
                <td>{l.country || "India"}</td>
                <td>{l.state || "-"}</td>
                <td>{l.city || "-"}</td>
                <td>
                  <strong>{l.locationName}</strong>
                </td>
                <td>{l.address || "-"}</td>
                <td>{l.buildings?.length || 0}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => openDeleteModal(l)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredItems.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    color: "#94a3b8",
                    padding: "20px",
                  }}
                >
                  No matching locations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mantine Delete Modal */}
      <Modal
        opened={opened}
        onClose={closeDeleteModal}
        centered
        size="md"
        title={
          <span style={{ fontWeight: "bold", fontSize: "18px" }}>
            Delete Location
          </span>
        }
      >
        <div style={{ paddingTop: "10px" }}>
          Are you sure you want to delete{" "}
          <strong>{selectedLocation?.locationName}</strong> ?
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "25px",
          }}
        >
          <Button color="gray" onClick={closeDeleteModal}>
            Cancel
          </Button>

          <Button color="red" onClick={confirmDelete}>
            Yes Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Locations;