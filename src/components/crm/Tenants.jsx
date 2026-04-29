import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Select, Text, Group, Badge, Textarea, Grid } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import api from "../../api/Interceptor";
import notify from "../utils/Notification";
import useDebounce from "../../common/useDebounce";
import DataTable from "../common/DataTable";

const Tenants = () => {
  const [items, setItems] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const debouncedSearch = useDebounce(search, 500);

  // Approve modal state
  const [approveModal, setApproveModal] = useState({ open: false, tenant: null, error: "" });

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
    paymentAmount: "",
    paymentMode: "CASH",
  });

  const [selectedRoom, setSelectedRoom] = useState(null);

  // ================== LOAD DATA ==================
  const load = async () => {
    try {
      setLoading(true);
      const [tenantRes, roomRes] = await Promise.all([
        api.get("/admin/tenants"),
        api.get("/admin/rooms"),
      ]);
      setItems(tenantRes.data?.response || tenantRes.data?.data || []);
      setRooms(roomRes.data?.response || roomRes.data?.data || []);
    } catch (error) {
      notify({ title: "Error!", message: "Failed to load tenants.", success: false, error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const loadBeds = async (roomId) => {
    const room = rooms.find(r => r.roomId === roomId);
    setSelectedRoom(room || null);
    setForm(f => ({ ...f, roomId, bedId: "" }));
    try {
      const res = await api.get(`/admin/beds/room/${roomId}/available`);
      setBeds(res.data?.response || res.data?.data || []);
    } catch {
      setBeds([]);
    }
  };

  // ================== SAVE / UPDATE ==================
  const validateForm = () => {
    const { fatherName, fatherMobile, motherName, motherMobile, guardianName, guardianMobile, paymentAmount } = form;
    if (!(fatherName && fatherMobile) && !(motherName && motherMobile) && !(guardianName && guardianMobile)) {
      notify({ title: "Validation Error", message: "At least one guardian detail must be provided.", success: false, error: true });
      return false;
    }
    if (!editingId && (paymentAmount === "" || Number(paymentAmount) <= 0)) {
      notify({ title: "Validation Error", message: "Advance payment must be greater than zero.", success: false, error: true });
      return false;
    }
    return true;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (editingId) {
        await api.put(`/admin/tenants/${editingId}`, form);
        notify({ title: "Updated!", message: "Tenant updated successfully.", success: true });
      } else {
        const { roomId, ...tenantData } = form;
        const res = await api.post(`/admin/tenants?bedId=${form.bedId}`, {
          ...tenantData,
          paymentAmount: Number(form.paymentAmount),
        });
        const created = res.data?.response || res.data?.data || {};
        notify({
          message: `PG No: ${created.pgNumber} — Status: ACTIVE. Initial payment recorded successfully.`,
          success: true,
        });
      }
      cancelEdit();
      load();
    } catch (error) {
      notify({ title: "Error!", message: error.response?.data?.message || "Failed to save tenant.", success: false, error: true });
    }
  };

  // ================== APPROVE FLOW ==================
  const openApprove = (tenant) => {
    setApproveModal({ open: true, tenant, error: "" });
  };

  const confirmApprove = async () => {
    const { tenant } = approveModal;
    try {
      await api.put(`/admin/tenants/${tenant.pgNumber}/approve`);
      notify({ title: "✅ Approved!", message: `${tenant.studentName} is now ACTIVE.`, success: true });
      setApproveModal({ open: false, tenant: null, error: "" });
      load();
    } catch (error) {
      const msg = error.response?.data?.message || "Approval failed";
      // Show the error inside the modal instead of closing
      setApproveModal(prev => ({ ...prev, error: msg }));
    }
  };

  // ================== EDIT ==================
  const handleEdit = async (item) => {
    // 1. First set basic form fields
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
      roomId: item.roomId || "",
      bedId: item.bedId || "",
      paymentAmount: "",
      paymentMode: "CASH",
    });

    // 2. Load beds for the room
    if (item.roomId) {
      const room = rooms.find(r => r.roomId === item.roomId);
      setSelectedRoom(room || null);
      
      try {
        const res = await api.get(`/admin/beds/room/${item.roomId}/available`);
        let availableBeds = res.data?.response || res.data?.data || [];
        
        // 3. IMPORTANT: Add the tenant's current bed to the available list 
        // so it shows up in the dropdown during edit.
        if (item.bedId && !availableBeds.find(b => b.bedId === item.bedId)) {
          availableBeds.push({
            bedId: item.bedId,
            bedNumber: item.bedNumber || "Current"
          });
        }
        
        setBeds(availableBeds);
        setForm(f => ({ ...f, bedId: item.bedId }));
      } catch {
        setBeds([]);
      }
    }
    
    setEditingId(item.pgNumber);
  };

  const toggleStatus = async (item) => {
    try {
      const action = item.status === "ACTIVE" ? "deactivate" : "activate";
      await api.put(`/admin/tenants/${item.pgNumber}/${action}`);
      notify({ title: "Status Updated", message: `Tenant ${action}d.`, success: true });
      load();
    } catch {
      notify({ title: "Error!", message: "Failed to update status.", success: false, error: true });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSelectedRoom(null);
    setBeds([]);
    setForm({ studentName: "", mobileNumber: "", email: "", dob: "", address: "", fatherName: "", fatherMobile: "", motherName: "", motherMobile: "", guardianName: "", guardianMobile: "", roomId: "", bedId: "", paymentAmount: "", paymentMode: "CASH" });
  };

  // ================== FILTER ==================
  const filteredItems = items.filter(t => {
    if (!debouncedSearch.trim()) return true;
    const text = debouncedSearch.toLowerCase();
    return (
      t.studentName?.toLowerCase().includes(text) ||
      t.pgNumber?.toLowerCase().includes(text) ||
      t.mobileNumber?.toLowerCase().includes(text)
    );
  });

  // Status badge config
  const statusConfig = {
    ACTIVE:       { color: "green",  label: "ACTIVE" },
    INACTIVE:     { color: "red",    label: "INACTIVE" },
  };

  const columns = [
    { header: "PG No", key: "pgNumber", render: (val) => <strong>{val}</strong> },
    { header: "Name", key: "studentName", render: (val) => <strong>{val}</strong> },
    { 
      header: "Contact", 
      key: "mobileNumber", 
      render: (_, t) => (
        <div>
          <Text size="xs">{t.mobileNumber}</Text>
          <Text size="xs" c="dimmed">{t.email}</Text>
        </div>
      )
    },
    { 
      header: "Room / Bed", 
      key: "roomName", 
      render: (val, t) => (
        <div>
          <Badge variant="outline">{val || "N/A"}</Badge>
          <Text size="xs" span ml={5}>Bed: {t.bedNumber || "N/A"}</Text>
        </div>
      )
    },
    { 
      header: "Rent", 
      key: "monthlyRent", 
      render: (val) => val ? <strong style={{ color: "#6366f1" }}>₹{val}</strong> : <Text c="dimmed" size="xs">—</Text>
    },
    { 
      header: "Status", 
      key: "status", 
      render: (val) => {
        const cfg = statusConfig[val] || { color: "gray", label: val };
        return <Badge color={cfg.color} variant="light">{cfg.label}</Badge>;
      }
    },
    { 
      header: "Actions", 
      key: "actions", 
      render: (_, t) => (
        <Group gap="xs" justify="center">
          <Button variant="light" color="yellow" size="compact-xs" onClick={() => handleEdit(t)}>Edit</Button>
          <Button variant="light" color={t.status === "ACTIVE" ? "red" : "green"} size="compact-xs" onClick={() => toggleStatus(t)}>
            {t.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </Button>
        </Group>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <h2>👤 Tenant Management</h2>
      </div>

      {/* -------- REGISTRATION FORM -------- */}
      <div className="form-card">
        <h3 style={{ marginBottom: "18px" }}>{editingId ? "✏️ Edit Tenant" : "➕ Register New Tenant"}</h3>

        {/* Room Rent Info Banner */}
        {selectedRoom && (
          <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "18px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "22px" }}>🏠</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px" }}>{selectedRoom.roomNumber} — {selectedRoom.roomType}</div>
              <div style={{ color: "#6366f1", fontWeight: 700, fontSize: "18px" }}>₹{selectedRoom.monthlyRent}/month</div>
            </div>
          </div>
        )}

        <form onSubmit={save}>
          <Grid gutter="md">
            {/* Personal Details */}
            <Grid.Col span={4}>
              <TextInput label="Student Name *" placeholder="Full Name" value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} required />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="Mobile Number *" placeholder="10 Digits" value={form.mobileNumber} onChange={e => setForm({ ...form, mobileNumber: e.target.value })} required />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="Email Address *" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="Date of Birth" type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
            </Grid.Col>
            <Grid.Col span={8}>
              <Textarea label="Address" placeholder="Full permanent address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} autosize minRows={1} />
            </Grid.Col>

            {/* Room Allocation */}
            <Grid.Col span={12} mt="sm"><Text fw={600} size="sm" c="blue">🛏️ Room Allocation</Text></Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Select Room"
                placeholder="Choose Room (rent auto-loaded)"
                data={rooms.map(r => ({ value: r.roomId, label: `Room ${r.roomNumber} — ${r.roomType} (₹${r.monthlyRent}/mo)` }))}
                value={form.roomId}
                onChange={loadBeds}
                searchable required
                disabled={!!editingId}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Select Bed"
                placeholder={form.roomId ? "Choose Bed" : "First select a room"}
                data={beds.map(b => ({ value: b.bedId, label: `Bed ${b.bedNumber}` }))}
                value={form.bedId}
                onChange={val => setForm({ ...form, bedId: val })}
                searchable required
                disabled={!form.roomId || !!editingId}
              />
            </Grid.Col>

            {/* Guardian Details */}
            <Grid.Col span={12} mt="sm"><Text fw={600} size="sm" c="blue">👨‍👩‍👧 Guardian Details (at least one required)</Text></Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="Father Name" value={form.fatherName} onChange={e => setForm({ ...form, fatherName: e.target.value })} />
              <TextInput label="Father Mobile" mt="xs" value={form.fatherMobile} onChange={e => setForm({ ...form, fatherMobile: e.target.value })} />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="Mother Name" value={form.motherName} onChange={e => setForm({ ...form, motherName: e.target.value })} />
              <TextInput label="Mother Mobile" mt="xs" value={form.motherMobile} onChange={e => setForm({ ...form, motherMobile: e.target.value })} />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="Guardian Name" value={form.guardianName} onChange={e => setForm({ ...form, guardianName: e.target.value })} />
              <TextInput label="Guardian Mobile" mt="xs" value={form.guardianMobile} onChange={e => setForm({ ...form, guardianMobile: e.target.value })} />
            </Grid.Col>

            {/* Advance Payment Details - Only for Registration */}
            {!editingId && (
              <>
                <Grid.Col span={12} mt="sm"><Text fw={600} size="sm" c="blue">💳 Advance Payment Details</Text></Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    type="number"
                    label="Advance Amount (₹) *"
                    placeholder="E.g., 6000"
                    value={form.paymentAmount}
                    onChange={e => setForm({ ...form, paymentAmount: e.target.value })}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Payment Mode *"
                    data={[
                      { value: "CASH", label: "💵 Cash" },
                      { value: "BANK_TRANSFER", label: "🏦 Bank Transfer" },
                      { value: "UPI", label: "📱 UPI" },
                      { value: "CHEQUE", label: "📄 Cheque" }
                    ]}
                    value={form.paymentMode}
                    onChange={val => setForm({ ...form, paymentMode: val })}
                    required
                  />
                </Grid.Col>
              </>
            )}
          </Grid>

          <Group mt="xl">
            <Button type="submit" className="btn btn-primary">
              {editingId ? "Update Tenant" : "Register Tenant"}
            </Button>
            {editingId && <Button variant="outline" color="gray" onClick={cancelEdit}>Cancel</Button>}
          </Group>
        </form>
      </div>

      {/* -------- TENANTS TABLE -------- */}
      <DataTable 
        title="All Tenants"
        columns={columns}
        data={filteredItems}
        loading={loading}
        search={search}
        onSearch={setSearch}
      />

    </div>
  );
};

export default Tenants;
