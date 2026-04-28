import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Select, Text, Group, Badge, Textarea, Grid } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import api from "../../api/Interceptor";
import notify from "../utils/Notification";
import useDebounce from "../../common/useDebounce";

const Tenants = () => {
  const [items, setItems] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);

  const [form, setForm] = useState({
    studentName: "",
    mobileNumber: "",
    email: "",
    dob: "",
    address: "",
    fatherName: "",
    fatherMobile: "",
    motherName: "",
    motherMobile: "",
    guardianName: "",
    guardianMobile: "",
    roomId: "",
    bedId: "",
  });

  const [editingId, setEditingId] = useState(null);
  const debouncedSearch = useDebounce(search, 500);

  // ================== LOAD DATA ==================
  const load = async () => {
    try {
      setLoading(true);
      // Fetching all for now as per previous pattern, but could use paginated if list grows large
      const tenantRes = await api.get("/admin/tenants");
      const roomRes = await api.get("/admin/rooms");

      setItems(tenantRes.data.response || tenantRes.data.data || []);
      setRooms(roomRes.data.response || roomRes.data.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      notify({
        title: "Error!",
        message: "Failed to load tenants or rooms.",
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

  const loadBeds = async (roomId) => {
    setForm((f) => ({ ...f, roomId, bedId: "" }));
    try {
      const res = await api.get(`/admin/beds/room/${roomId}/available`);
      setBeds(res.data.response || res.data.data || []);
    } catch (error) {
      console.error("Error loading beds:", error);
    }
  };

  // ================== SAVE / UPDATE ==================
  const validateForm = () => {
    const { fatherName, fatherMobile, motherName, motherMobile, guardianName, guardianMobile } = form;
    const hasFather = fatherName && fatherMobile;
    const hasMother = motherName && motherMobile;
    const hasGuardian = guardianName && guardianMobile;

    if (!hasFather && !hasMother && !hasGuardian) {
      notify({
        title: "Validation Error",
        message: "At least one guardian's details (Father, Mother, or Guardian) must be fully provided (Name and Mobile).",
        success: false,
        error: true,
      });
      return false;
    }
    return true;
  };

  const save = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingId) {
        // Update
        await api.put(`/admin/tenants/${editingId}`, form);
        notify({
          title: "Updated!",
          message: "Tenant updated successfully.",
          success: true,
        });
      } else {
        // Create
        const { roomId, ...tenantData } = form;
        const res = await api.post(`/admin/tenants?bedId=${form.bedId}`, tenantData);
        const created = res.data.response || res.data.data || {};
        notify({
          title: "Success!",
          message: `Tenant created! PG No: ${created.pgNumber}`,
          success: true,
        });
      }

      cancelEdit();
      load();
    } catch (error) {
      console.error(error);
      notify({
        title: "Error!",
        message: error.response?.data?.message || "Failed to save tenant.",
        success: false,
        error: true,
      });
    }
  };

  // ================== EDIT / STATUS ==================
  const handleEdit = async (item) => {
    setForm({
      studentName: item.studentName || "",
      mobileNumber: item.mobileNumber || "",
      email: item.email || "",
      dob: item.dob || "",
      address: item.address || "",
      fatherName: item.fatherName || "",
      fatherMobile: item.fatherMobile || "",
      motherName: item.motherName || "",
      motherMobile: item.motherMobile || "",
      guardianName: item.guardianName || "",
      guardianMobile: item.guardianMobile || "",
      roomId: item.bed?.room?.roomId || "",
      bedId: item.bedId || "",
    });
    
    if (item.bed?.room?.roomId) {
      await loadBeds(item.bed?.room?.roomId);
      setForm(f => ({ ...f, bedId: item.bedId }));
    }
    
    setEditingId(item.pgNumber);
  };

  const toggleStatus = async (item) => {
    try {
      const action = item.status === "ACTIVE" ? "deactivate" : "activate";
      await api.put(`/admin/tenants/${item.pgNumber}/${action}`);
      notify({
        title: "Status Updated",
        message: `Tenant ${action}d successfully.`,
        success: true,
      });
      load();
    } catch (error) {
      notify({
        title: "Error!",
        message: "Failed to update tenant status.",
        success: false,
        error: true,
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      studentName: "",
      mobileNumber: "",
      email: "",
      dob: "",
      address: "",
      fatherName: "",
      fatherMobile: "",
      motherName: "",
      motherMobile: "",
      guardianName: "",
      guardianMobile: "",
      roomId: "",
      bedId: "",
    });
    setBeds([]);
  };

  // ================== UTILS ==================
  const filteredItems = items.filter((t) => {
    if (!debouncedSearch.trim()) return true;
    const text = debouncedSearch.toLowerCase();
    return (
      t.studentName?.toLowerCase().includes(text) ||
      t.pgNumber?.toLowerCase().includes(text) ||
      t.mobileNumber?.toLowerCase().includes(text) ||
      t.bed?.room?.roomNumber?.toLowerCase().includes(text)
    );
  });

  return (
    <div>
      <div className="page-header">
        <h2>Tenant Management</h2>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <h3 style={{ marginBottom: "25px" }}>
          {editingId ? "Edit Tenant" : "Register New Tenant"}
        </h3>

        <form onSubmit={save}>
          <Grid gutter="md">
            {/* Student Details */}
            <Grid.Col span={4}>
              <TextInput label="Student Name" placeholder="Full Name" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} required />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="Mobile Number" placeholder="10 Digits" value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} required />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="Email Address" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="Date of Birth" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </Grid.Col>
            <Grid.Col span={8}>
              <Textarea label="Address" placeholder="Full permanent address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} autosize minRows={1} />
            </Grid.Col>

            {/* Room Allocation */}
            <Grid.Col span={12} mt="sm"><Text weight={600} size="sm" color="blue">Room Allocation</Text></Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Select Room"
                placeholder="Choose Room"
                data={rooms.map((r) => ({ value: r.roomId, label: `Room ${r.roomNumber} - ${r.roomType} (₹${r.monthlyRent})` }))}
                value={form.roomId}
                onChange={(val) => loadBeds(val)}
                searchable
                required
                disabled={!!editingId}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Select Bed"
                placeholder={form.roomId ? "Choose Bed" : "First select a room"}
                data={beds.map((b) => ({ value: b.bedId, label: `Bed ${b.bedNumber}` }))}
                value={form.bedId}
                onChange={(val) => setForm({ ...form, bedId: val })}
                searchable
                required
                disabled={!form.roomId || !!editingId}
              />
            </Grid.Col>

            {/* Guardian Details */}
            <Grid.Col span={12} mt="sm"><Text weight={600} size="sm" color="blue">Guardian Details (At least one mandatory)</Text></Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="Father Name" value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} />
              <TextInput label="Father Mobile" mt="xs" value={form.fatherMobile} onChange={(e) => setForm({ ...form, fatherMobile: e.target.value })} />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="Mother Name" value={form.motherName} onChange={(e) => setForm({ ...form, motherName: e.target.value })} />
              <TextInput label="Mother Mobile" mt="xs" value={form.motherMobile} onChange={(e) => setForm({ ...form, motherMobile: e.target.value })} />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="Guardian Name" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} />
              <TextInput label="Guardian Mobile" mt="xs" value={form.guardianMobile} onChange={(e) => setForm({ ...form, guardianMobile: e.target.value })} />
            </Grid.Col>
          </Grid>

          <Group mt="xl">
            <Button type="submit" className="btn btn-primary">
              {editingId ? "Update Tenant" : "Register Tenant"}
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
          <h3>All Tenants ({filteredItems.length})</h3>
          <TextInput
            placeholder="Search by Name, PG No or Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "350px" }}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>PG No</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Room / Bed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((t) => (
              console.log(t,"huhhu"),
              <tr key={t.id || t.pgNumber}>
                <td><strong>{t.pgNumber}</strong></td>
                <td><strong>{t.studentName}</strong></td>
                <td>
                  <Text size="xs">{t.mobileNumber}</Text>
                  <Text size="xs" color="dimmed">{t.email}</Text>
                </td>
                <td>
                   <Badge variant="outline">{t.roomName || "N/A"}</Badge>
                   <Text size="xs" span ml={5}>Bed: {t.bedNumber || "N/A"}</Text>
                </td>
                <td>
                  <Badge color={t.status === "ACTIVE" ? "green" : "red"} variant="light">
                    {t.status}
                  </Badge>
                </td>
                <td>
                  <Group gap="xs">
                    <Button variant="light" color="yellow" size="compact-xs" onClick={() => handleEdit(t)}>
                      Edit
                    </Button>
                    <Button 
                      variant="light" 
                      color={t.status === "ACTIVE" ? "red" : "green"} 
                      size="compact-xs" 
                      onClick={() => toggleStatus(t)}
                    >
                      {t.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  {loading ? "Loading tenants..." : "No tenants found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tenants;
