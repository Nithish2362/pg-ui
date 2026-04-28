import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Select, Text, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import api from "../../../api/Interceptor";
import notify from "../../utils/Notification";

import useDebounce from "../../../common/useDebounce";

const Buildings = () => {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);

  const [form, setForm] = useState({
    buildingName: "",
    locationId: "",
  });

  const [editingId, setEditingId] = useState(null);
  const debouncedSearch = useDebounce(search, 500);

  // ================== LOAD DATA ==================
  const load = async () => {
    try {
      setLoading(true);
      const buildingRes = await api.get("/admin/buildings");
      const locationRes = await api.get("/admin/locations/get-all");

      setItems(buildingRes.data.response || buildingRes.data.data || buildingRes.data || []);
      setLocations(locationRes.data.response || locationRes.data.data || locationRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      notify({
        title: "Error!",
        message: "Failed to load buildings or locations.",
        success: false,
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ================== SAVE / UPDATE ==================
  const save = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/admin/buildings/${editingId}`, {
          buildingName: form.buildingName,
          locationId: form.locationId,
        });

        notify({
          title: "Updated!",
          message: "Building updated successfully.",
          success: true,
        });
      } else {
        await api.post(`/admin/buildings?locationId=${form.locationId}`, {
          buildingName: form.buildingName,
        });

        notify({
          title: "Success!",
          message: "Building created successfully.",
          success: true,
        });
      }

      setForm({ buildingName: "", locationId: "" });
      setEditingId(null);
      load();
    } catch (error) {
      console.error(error);
      notify({
        title: "Error!",
        message: error.response?.data?.message || "Failed to save building.",
        success: false,
        error: true,
      });
    }
  };

  // ================== EDIT / DELETE ==================
  const handleEdit = (item) => {
    setForm({
      buildingName: item.buildingName || "",
      locationId: item.locationId || "",
    });
    setEditingId(item.buildingId); // Using business ID for the URL path
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    open();
  };

  const confirmDelete = async () => {
    if (!selectedItem?.buildingId) return;

    try {
      await api.delete(`/admin/buildings/${selectedItem.buildingId}`);
      notify({
        title: "Deleted!",
        message: "Building deleted successfully.",
        success: true,
      });
      close();
      load();
    } catch (error) {
      notify({
        title: "Error!",
        message: "Unable to delete building.",
        success: false,
        error: true,
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ buildingName: "", locationId: "" });
  };

  // ================== UTILS ==================
  const getLocationName = (id) => {
    const loc = locations.find((x) => x.locationId === id);
    return loc ? loc.locationName : id;
  };

  const filteredItems = items.filter((b) => {
    if (!debouncedSearch.trim()) return true;
    const text = debouncedSearch.toLowerCase();
    return (
      b.buildingName?.toLowerCase().includes(text) ||
      b.buildingId?.toLowerCase().includes(text) ||
      getLocationName(b.locationId)?.toLowerCase().includes(text)
    );
  });

  return (
    <div>
      <div className="page-header">
        <h2>Building Management</h2>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <h3 style={{ marginBottom: "15px" }}>
          {editingId ? "Edit Building" : "Add New Building"}
        </h3>

        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group">
              <label>Location</label>
              <Select
                placeholder="Select Location"
                data={locations.map((loc) => ({ value: loc.locationId, label: loc.locationName }))}
                value={form.locationId}
                onChange={(val) => setForm({ ...form, locationId: val })}
                disabled={!!editingId}
                searchable
                required
              />
            </div>

            <div className="form-group">
              <label>Building Name</label>
              <TextInput
                placeholder="Enter Building Name"
                value={form.buildingName}
                onChange={(e) => setForm({ ...form, buildingName: e.target.value })}
                required
              />
            </div>
          </div>

          <Group mt="md">
            <Button type="submit" className="btn btn-primary">
              {editingId ? "Update Building" : "Save Building"}
            </Button>
            {editingId && (
              <Button variant="outline" color="gray" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </Group>
        </form>
      </div>

      {/* Data Table Card */}
      <div className="data-card">
        <div className="data-card-header">
          <h3>All Buildings ({filteredItems.length})</h3>
          <TextInput
            placeholder="Search by Name, ID or Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "300px" }}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Building ID</th>
              <th>Building Name</th>
              <th>Location</th>
              <th>Floors</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((b) => (
              <tr key={b.id || b.buildingId}>
                <td><strong>{b.buildingId}</strong></td>
                <td>{b.buildingName}</td>
                <td>{getLocationName(b.locationId)}</td>
                <td>{b.floors?.length || 0}</td>
                <td>
                  <Group gap="xs">
                    <Button variant="light" color="yellow" size="compact-xs" onClick={() => handleEdit(b)}>
                      Edit
                    </Button>
                    <Button variant="light" color="red" size="compact-xs" onClick={() => openDeleteModal(b)}>
                      Delete
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  {loading ? "Loading buildings..." : "No buildings found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal opened={opened} onClose={close} title="Delete Building" centered>
        <Text size="sm">
          Are you sure you want to delete building <strong>{selectedItem?.buildingName}</strong>? This action cannot be undone.
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={close}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default Buildings;