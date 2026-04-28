import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Select, Text, Group, Badge, NumberInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import api from "../../../api/Interceptor";
import notify from "../../utils/Notification";

import useDebounce from "../../../common/useDebounce";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);

  const [form, setForm] = useState({
    roomNumber: "",
    roomType: "AC",
    sharingType: 2,
    monthlyRent: "",
    totalBeds: 2,
    floorId: "",
  });
  console.log()
  const [editingId, setEditingId] = useState(null);
  const debouncedSearch = useDebounce(search, 500);

  // ================== LOAD DATA ==================
  const load = async () => {
    try {
      setLoading(true);
      const roomRes = await api.get("/admin/rooms");
      const floorRes = await api.get("/admin/floors");

      setRooms(roomRes.data.response || roomRes.data.data || roomRes.data || []);
      setFloors(floorRes.data.response || floorRes.data.data || floorRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      notify({
        title: "Error!",
        message: "Failed to load rooms or floors.",
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

    const payload = {
      ...form,
      sharingType: parseInt(form.sharingType),
      monthlyRent: parseFloat(form.monthlyRent),
      totalBeds: parseInt(form.totalBeds),
    };

    try {
      if (editingId) {
        await api.put(`/admin/rooms/${editingId}`, payload);
        notify({
          title: "Updated!",
          message: "Room updated successfully.",
          success: true,
        });
      } else {
        await api.post("/admin/rooms", payload);
        notify({
          title: "Success!",
          message: "Room created successfully.",
          success: true,
        });
      }

      setForm({
        roomNumber: "",
        roomType: "AC",
        sharingType: 2,
        monthlyRent: "",
        totalBeds: "",
        floorId: "",
      });
      setEditingId(null);
      load();
    } catch (error) {
      console.error(error);
      notify({
        title: "Error!",
        message: error.response?.data?.message || "Failed to save room.",
        success: false,
        error: true,
      });
    }
  };

  // ================== EDIT / DELETE ==================
  const handleEdit = (item) => {
    setForm({
      roomNumber: item.roomNumber || "",
      roomType: item.roomType || "AC",
      sharingType: item.sharingType || 2,
      monthlyRent: item.monthlyRent || "",
      totalBeds: item.totalBeds || "",
      floorId: item.floorId || "",
    });
    setEditingId(item.roomId);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    open();
  };

  const confirmDelete = async () => {
    if (!selectedItem?.roomId) return;

    try {
      await api.delete(`/admin/rooms/${selectedItem.roomId}`);
      notify({
        title: "Deleted!",
        message: "Room deleted successfully.",
        success: true,
      });
      close();
      load();
    } catch (error) {
      notify({
        title: "Error!",
        message: "Unable to delete room.",
        success: false,
        error: true,
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      roomNumber: "",
      roomType: "AC",
      sharingType: 2,
      monthlyRent: "",
      totalBeds: "",
      floorId: "",
    });
  };

  // ================== UTILS ==================
  const getFloorName = (id) => {
    const floor = floors.find((x) => x.floorId === id);
    return floor ? floor.floorName : id;
  };

  const filteredItems = rooms.filter((r) => {
    if (!debouncedSearch.trim()) return true;
    const text = debouncedSearch.toLowerCase();
    return (
      r.roomNumber?.toLowerCase().includes(text) ||
      r.roomId?.toLowerCase().includes(text) ||
      getFloorName(r.floorId)?.toLowerCase().includes(text)
    );
  });

  return (
    <div>
      <div className="page-header">
        <h2>Room Management</h2>
      </div>

      <div className="form-card">
        <h3 style={{ marginBottom: "15px" }}>
          {editingId ? "Edit Room" : "Add New Room"}
        </h3>

        <form onSubmit={save}>
          <div className="form-grid">
            <div className="form-group">
              <label>Floor</label>
              <Select
                placeholder="Select Floor"
                data={floors.map((f) => ({ value: f.floorId, label: f.floorName }))}
                value={form.floorId}
                onChange={(val) => setForm({ ...form, floorId: val })}
                disabled={!!editingId}
                searchable
                required
              />
            </div>

            <div className="form-group">
              <label>Room Number</label>
              <TextInput
                placeholder="e.g. 101"
                value={form.roomNumber}
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Room Type</label>
              <Select
                data={[
                  { value: "AC", label: "AC" },
                  { value: "NON_AC", label: "Non-AC" },
                ]}
                value={form.roomType}
                onChange={(val) => setForm({ ...form, roomType: val })}
                required
              />
            </div>

            <div className="form-group">
              <label>Sharing Type</label>
              <Select
                data={[
                  { value: "1", label: "1 Sharing" },
                  { value: "2", label: "2 Sharing" },
                  { value: "3", label: "3 Sharing" },
                  { value: "4", label: "4 Sharing" },
                  { value: "5", label: "5 Sharing" },
                  { value: "6", label: "6 Sharing" },

                ]}
                value={form.sharingType}
                onChange={(val) =>
                  setForm({
                    ...form,
                    sharingType: val,
                    totalBeds: val, // auto set beds same as sharing
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Monthly Rent (₹)</label>
              <TextInput
                type="number"
                placeholder="Rent amount"
                value={form.monthlyRent}
                onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Total Beds</label>
              <TextInput
                type="number"
                placeholder="Number of beds"
                value={form.totalBeds}
                required
              />
            </div>
          </div>

          <Group mt="md">
            <Button type="submit" className="btn btn-primary">
              {editingId ? "Update Room" : "Save Room"}
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
          <h3>All Rooms ({filteredItems.length})</h3>
          <TextInput
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "300px" }}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Room ID</th>
              <th>Room #</th>
              <th>Floor</th>
              <th>Type</th>
              <th>Sharing</th>
              <th>Rent</th>
              <th>Beds</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((r) => (
              <tr key={r.id || r.roomId}>
                <td><strong>{r.roomId}</strong></td>
                <td>{r.roomNumber}</td>
                <td>{getFloorName(r.floorId)}</td>
                <td>
                  <Badge color={r.roomType === "AC" ? "blue" : "orange"} variant="light">
                    {r.roomType}
                  </Badge>
                </td>
                <td>{r.sharingType} Sharing</td>
                <td>₹{r.monthlyRent}</td>
                <td>{r.beds?.length || r.totalBeds}</td>
                <td>
                  <Group gap="xs">
                    <Button variant="light" color="yellow" size="compact-xs" onClick={() => handleEdit(r)}>
                      Edit
                    </Button>
                    <Button variant="light" color="red" size="compact-xs" onClick={() => openDeleteModal(r)}>
                      Delete
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  {loading ? "Loading rooms..." : "No rooms found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal opened={opened} onClose={close} title="Delete Room" centered>
        <Text size="sm">
          Are you sure you want to delete room <strong>{selectedItem?.roomNumber}</strong>? This action cannot be undone.
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={close}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default Rooms;
