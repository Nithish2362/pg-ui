import React, { useState, useEffect } from "react";
import { Modal, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import api from "../../../api/Interceptor";
import indiaLocations from "./StatesAndDistricts.json";
import notify from "../../utils/Notification";

import useDebounce from "../../../common/useDebounce";

const Locations = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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

  const debouncedSearch = useDebounce(search, 500);

  const states = Object.keys(indiaLocations);
  const cities = form.state ? indiaLocations[form.state] : [];

  // ================= LOAD LOCATIONS =================
  const load = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/locations/get-all");

      const responseData =
        res.data.response || res.data.data || res.data || [];

      setItems(Array.isArray(responseData) ? responseData : []);
    } catch (error) {
      console.error("Error loading locations:", error);

      notify({
        title: "Error!",
        message: "Failed to load locations.",
        success: false,
        error: true,
      });

      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ================= SAVE LOCATION =================
  const save = async (e) => {
    e.preventDefault();

    const payload = {
      locationName: form.locationName,
      locationNumber: form.locationNumber,
      address: form.address,
      city: form.city,
      state: form.state,
    };

    try {
      await api.post("/admin/locations", payload);

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
      console.error(error);

      notify({
        title: "Error!",
        message:
          error.response?.data?.message || "Failed to save location.",
        success: false,
        error: true,
      });
    }
  };

  // ================= DELETE LOCATION =================
  const openDeleteModal = (location) => {
    setSelectedLocation(location);
    open();
  };

  const closeDeleteModal = () => {
    setSelectedLocation(null);
    close();
  };

  const confirmDelete = async () => {
    if (!selectedLocation?.id) return;

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

  // ================= FILTER =================
  const filteredItems = items.filter((l) => {
    if (!debouncedSearch.trim()) return true;

    const text = debouncedSearch.toLowerCase();

    return (
      l.locationName?.toLowerCase().includes(text) ||
      l.locationId?.toLowerCase().includes(text) ||
      l.locationNumber?.toLowerCase().includes(text) ||
      l.city?.toLowerCase().includes(text) ||
      l.address?.toLowerCase().includes(text)
    );
  });

  return (
    <div>
      <div className="page-header">
        <h2>Location Management</h2>
      </div>

      {/* Add Form */}
      <div className="form-card">
        <h3 style={{ marginBottom: "15px" }}>Add New Location</h3>

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
                placeholder="Enter Location Name"
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
                placeholder="Enter Location Number"
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
            type="submit"
            className="btn btn-primary"
            disabled={
              !form.state ||
              !form.city ||
              !form.locationName ||
              !form.address
            }
          >
            Save Location
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="data-card">
        <div className="data-card-header">
          <h3>All Locations ({filteredItems.length})</h3>

          <input
            type="text"
            placeholder="Search by ID, Name, City or Address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "340px",
              padding: "10px 12px",
              borderRadius: "6px",
            }}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Location ID</th>
              <th>Location Name</th>
              <th>City</th>
              <th>Address</th>
              <th>Buildings</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((l) => (
              <tr key={l.id || l.locationId}>
                <td>
                  <strong>{l.locationId || "-"}</strong>
                </td>
                <td>{l.locationName}</td>
                <td>{l.city || "-"}</td>
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
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                  }}
                >
                  {loading
                    ? "Loading locations..."
                    : "No locations found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      <Modal
        opened={opened}
        onClose={closeDeleteModal}
        centered
        title="Delete Location"
      >
        <p>
          Are you sure you want to delete{" "}
          <strong>{selectedLocation?.locationName}</strong>?
        </p>

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
            Yes, Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Locations;