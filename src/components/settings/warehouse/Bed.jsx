import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Select, Text, Group, Badge, Switch } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import api from "../../../api/Interceptor";
import notify from "../utils/Notification";
import useDebounce from "../../../common/useDebounce";

const Beds = () => {
  const [beds, setBeds] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);

  const [form, setForm] = useState({
    bedNumber: "",
    isOccupied: false,
    roomId: "",
  });

  const [editingId, setEditingId] = useState(null);
  const debouncedSearch = useDebounce(search, 500);

  // ================== LOAD DATA ==================
  const load = async () => {
    try {
      setLoading(true);
      const bedRes = await api.get("/admin/beds");
      const roomRes = await api.get("/admin/rooms");

      setBeds(bedRes.data.response || bedRes.data.data || bedRes.data || []);
      setRooms(roomRes.data.response || roomRes.data.data || roomRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      notify({
        title: "Error!",
        message: "Failed to load beds or rooms.",
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
        await api.put(`/admin/beds/${editingId}`, form);
        notify({
          title: "Updated!",
          message: "Bed updated successfully.",
          success: true,
        });
      } else {
        await api.post("/admin/beds", form);
        notify({
          title: "Success!",
          message: "Bed created successfully.",
          success: true,
        });
      }

      setForm({ bedNumber: "", isOccupied: false, roomId: "" });
      setEditingId(null);
      load();
    } catch (error) {
      console.error(error);
      notify({
        title: "Error!",
        message: error.response?.data?.message || "Failed to save bed.",
        success: false,
        error: true,
      });
    }
  };

  // ================== EDIT / DELETE ==================
  const handleEdit = (item) => {
    setForm({
      bedNumber: item.bedNumber || "",
      isOccupied: item.isOccupied || false,
      roomId: item.roomId || "",
    });
    setEditingId(item.bedId);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    open();
  };

  const confirmDelete = async () => {
    if (!selectedItem?.bedId) return;

    try {
      await api.delete(`/admin/beds/${selectedItem.bedId}`);
      notify({
        title: "Deleted!",
        message: "Bed deleted successfully.",
        success: true,
      });
      close();
      load();
    } catch (error) {
      notify({
        title: "Error!",
        message: "Unable to delete bed.",
        success: false,
        error: true,
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ bedNumber: "", isOccupied: false, roomId: "" });
  };

  // ================== UTILS ==================
  const getRoomNumber = (id) => {
    const room = rooms.find((x) => x.roomId === id);
    return room ? room.roomNumber : id;
  };

  const filteredItems = beds.filter((b) => {
    if (!debouncedSearch.trim()) return true;
    const text = debouncedSearch.toLowerCase();
    return (
      b.bedNumber?.toLowerCase().includes(text) ||
      b.bedId?.toLowerCase().includes(text) ||
      getRoomNumber(b.roomId)?.toLowerCase().includes(text)
    );
  });

  return (
    <div>
      <div className="page-header">
        <h2>Bed Management</h2>
      </div>

      <div className="form-card">
        <h3 style={{ marginBottom: "15px" }}>
          {editingId ? "Edit Bed" : "Add New Bed"}
        </h3>

        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group">
              <label>Room</label>
              <Select
                placeholder="Select Room"
                data={rooms.map((r) => ({ value: r.roomId, label: `Room ${r.roomNumber} (${r.roomId})` }))}
                value={form.roomId}
                onChange={(val) => setForm({ ...form, roomId: val })}
                disabled={!!editingId}
                searchable
                required
              />
            </div>

            <div className="form-group">
              <label>Bed Number</label>
              <TextInput
                placeholder="e.g. B1"
                value={form.bedNumber}
                onChange={(e) => setForm({ ...form, bedNumber: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '25px' }}>
               <Switch
                label="Is Occupied?"
                checked={form.isOccupied}
                onChange={(event) => setForm({ ...form, isOccupied: event.currentTarget.checked })}
              />
            </div>
          </div>

          <Group mt="md">
            <Button type="submit" className="btn btn-primary">
              {editingId ? "Update Bed" : "Save Bed"}
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
          <h3>All Beds ({filteredItems.length})</h3>
          <TextInput
            placeholder="Search beds..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "300px" }}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Bed ID</th>
              <th>Bed Number</th>
              <th>Room</th>
              <th>Occupied</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((b) => (
              <tr key={b.id || b.bedId}>
                <td><strong>{b.bedId}</strong></td>
                <td>{b.bedNumber}</td>
                <td>{getRoomNumber(b.roomId)}</td>
                <td>
                  <Badge color={b.isOccupied ? "red" : "green"} variant="light">
                    {b.isOccupied ? "Yes" : "No"}
                  </Badge>
                </td>
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
                  {loading ? "Loading beds..." : "No beds found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal opened={opened} onClose={close} title="Delete Bed" centered>
        <Text size="sm">
          Are you sure you want to delete bed <strong>{selectedItem?.bedNumber}</strong>? This action cannot be undone.
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={close}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default Beds;
