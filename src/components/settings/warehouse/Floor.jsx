import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Select, Text, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import api from "../../../api/Interceptor";
import notify from "../../utils/Notification";

import useDebounce from "../../../common/useDebounce";

const Floors = () => {
  const [floors, setFloors] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);

  const [form, setForm] = useState({
    floorNumber: "",
    floorName: "",
    buildingId: "",
  });

  const [editingId, setEditingId] = useState(null);
  const debouncedSearch = useDebounce(search, 500);

  // ================== LOAD DATA ==================
  const load = async () => {
    try {
      setLoading(true);
      const floorRes = await api.get("/admin/floors");
      const buildingRes = await api.get("/admin/buildings");

      setFloors(floorRes.data.response || floorRes.data.data || floorRes.data || []);
      setBuildings(buildingRes.data.response || buildingRes.data.data || buildingRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      notify({
        title: "Error!",
        message: "Failed to load floors or buildings.",
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
        await api.put(`/admin/floors/${editingId}`, {
          floorNumber: form.floorNumber,
          floorName: form.floorName,
          buildingId: form.buildingId,
        });

        notify({
          title: "Updated!",
          message: "Floor updated successfully.",
          success: true,
        });
      } else {
        await api.post(`/admin/floors?buildingId=${form.buildingId}`, {
          floorNumber: form.floorNumber,
          floorName: form.floorName,
        });

        notify({
          title: "Success!",
          message: "Floor created successfully.",
          success: true,
        });
      }

      setForm({ floorNumber: "", floorName: "", buildingId: "" });
      setEditingId(null);
      load();
    } catch (error) {
      console.error(error);
      notify({
        title: "Error!",
        message: error.response?.data?.message || "Failed to save floor.",
        success: false,
        error: true,
      });
    }
  };

  // ================== EDIT / DELETE ==================
  const handleEdit = (item) => {
    setForm({
      floorNumber: item.floorNumber || "",
      floorName: item.floorName || "",
      buildingId: item.buildingId || "",
    });
    setEditingId(item.floorId);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    open();
  };

  const confirmDelete = async () => {
    if (!selectedItem?.floorId) return;

    try {
      await api.delete(`/admin/floors/${selectedItem.floorId}`);
      notify({
        title: "Deleted!",
        message: "Floor deleted successfully.",
        success: true,
      });
      close();
      load();
    } catch (error) {
      notify({
        title: "Error!",
        message: "Unable to delete floor.",
        success: false,
        error: true,
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ floorNumber: "", floorName: "", buildingId: "" });
  };

  // ================== UTILS ==================
  const getBuildingName = (id) => {
    const bld = buildings.find((x) => x.buildingId === id);
    return bld ? bld.buildingName : id;
  };

  const filteredItems = floors.filter((f) => {
    if (!debouncedSearch.trim()) return true;
    const text = debouncedSearch.toLowerCase();
    return (
      f.floorName?.toLowerCase().includes(text) ||
      f.floorId?.toLowerCase().includes(text) ||
      getBuildingName(f.buildingId)?.toLowerCase().includes(text)
    );
  });

  return (
    <div>
      <div className="page-header">
        <h2>Floor Management</h2>
      </div>

      <div className="form-card">
        <h3 style={{ marginBottom: "15px" }}>
          {editingId ? "Edit Floor" : "Add New Floor"}
        </h3>

        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group">
              <label>Building</label>
              <Select
                placeholder="Select Building"
                data={buildings.map((b) => ({ value: b.buildingId, label: b.buildingName }))}
                value={form.buildingId}
                onChange={(val) => setForm({ ...form, buildingId: val })}
                disabled={!!editingId}
                searchable
                required
              />
            </div>

            <div className="form-group">
              <label>Floor Number</label>
              <TextInput
                type="number"
                placeholder="e.g. 1"
                value={form.floorNumber}
                onChange={(e) => setForm({ ...form, floorNumber: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Floor Name</label>
              <TextInput
                placeholder="e.g. Ground Floor"
                value={form.floorName}
                onChange={(e) => setForm({ ...form, floorName: e.target.value })}
                required
              />
            </div>
          </div>

          <Group mt="md">
            <Button type="submit" className="btn btn-primary">
              {editingId ? "Update Floor" : "Save Floor"}
            </Button>
            {editingId && (
              <Button variant="outline" color="gray" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </Group>
        </form>
      </div>

      <div className="data-card">
        <div className="data-card-header">
          <h3>All Floors ({filteredItems.length})</h3>
          <TextInput
            placeholder="Search floors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "300px" }}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Floor ID</th>
              <th>Floor #</th>
              <th>Name</th>
              <th>Building</th>
              <th>Rooms</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((f) => (
              <tr key={f.id || f.floorId}>
                <td><strong>{f.floorId}</strong></td>
                <td>{f.floorNumber}</td>
                <td>{f.floorName}</td>
                <td>{getBuildingName(f.buildingId)}</td>
                <td>{f.rooms?.length || 0}</td>
                <td>
                  <Group gap="xs">
                    <Button variant="light" color="yellow" size="compact-xs" onClick={() => handleEdit(f)}>
                      Edit
                    </Button>
                    <Button variant="light" color="red" size="compact-xs" onClick={() => openDeleteModal(f)}>
                      Delete
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  {loading ? "Loading floors..." : "No floors found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal opened={opened} onClose={close} title="Delete Floor"  styles={{
    title: {
      fontSize: "18px",
      fontWeight: 600,
      color: "#e03131", // red color
    },
  }} centered>
        <Text size="sm">
          Are you sure you want to delete floor <strong>{selectedItem?.floorName}</strong>? This action cannot be undone.
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={close}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default Floors;
