import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Select, Text, Group, Badge, Textarea, Grid, ThemeIcon, Tabs } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { IconArrowLeft, IconPlus, IconCheck, IconCreditCard, IconCash, IconQrcode, IconDeviceMobile, IconEdit, IconUserPlus, IconHome, IconBed, IconUsers } from "@tabler/icons-react";
import api from "../../api/Interceptor";
import notify from "../utils/Notification";
import useDebounce from "../../common/useDebounce";
import DataTable from "../common/DataTable";

const Tenants = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const isCreateMode = locationState.pathname === "/tenants/create";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusOpened, { open: openStatus, close: closeStatus }] = useDisclosure(false);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("awaiting");
  const [editingId, setEditingId] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [counts, setCounts] = useState({ awaiting: 0, active: 0, notifications: 0 });
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
    fatherEmail: "",
    motherName: "",
    motherMobile: "",
    motherEmail: "",
    guardianName: "",
    guardianMobile: "",
    guardianEmail: "",
    roomId: "",
    bedId: "",
    paymentAmount: "",
    paymentMode: "",
    rentStartDate: "",
    rentEndDate: "",
  });

  const [selectedRoom, setSelectedRoom] = useState(null);

  // ================== LOAD DATA ==================
  const load = async () => {
    try {
      setLoading(true);

      const statusMap = {
        awaiting: "NOT_APPROVED",
        active: "ACTIVE",
        notifications: "ACTIVE" // Notifications are for active users
      };

      const [tenantRes, roomRes, payRes, countsRes] = await Promise.all([
        api.get(`/admin/tenants/view?page=${page - 1}&pageSize=${pageSize}&status=${statusMap[activeTab] || 'ACTIVE'}&searchTerm=${debouncedSearch}`),
        api.get("/admin/rooms"),
        api.get("/admin/payments"),
        api.get("/admin/tenants/counts")
      ]);

      setItems(tenantRes.data?.response || []);
      setTotalCount(tenantRes.data?.count || 0);
      setRooms(roomRes.data?.response || roomRes.data?.data || []);
      setPayments(payRes.data?.response || payRes.data?.data || payRes.data || []);
      setCounts(countsRes.data?.response || { awaiting: 0, active: 0, notifications: 0 });
    } catch (error) {
      notify({ title: "Error!", message: "Failed to load tenants.", success: false, error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, activeTab, debouncedSearch, pageSize]);

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
      notify({ title: "Validation Error", message: "Advance payment is mandatory for tenant registration. Amount must be greater than zero.", success: false, error: true });
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
      navigate("/tenants");
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
      fatherEmail: item.fatherEmail || "",
      motherName: item.motherName || "",
      motherMobile: item.motherMobile || "",
      motherEmail: item.motherEmail || "",
      guardianName: item.guardianName || "",
      guardianMobile: item.guardianMobile || "",
      guardianEmail: item.guardianEmail || "",
      roomId: item.roomId || "",
      bedId: item.bedId || "",
      paymentAmount: "",
      paymentMode: "CASH",
      rentStartDate: item.rentStartDate || "",
      rentEndDate: item.rentEndDate || "",
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
    navigate("/tenants/create");
  };

  const openStatusModal = (item) => {
    setSelectedItem(item);
    openStatus();
  };

  const confirmToggleStatus = async () => {
    if (!selectedItem) return;
    try {
      const action = selectedItem.status === "ACTIVE" ? "deactivate" : "activate";
      await api.put(`/admin/tenants/${selectedItem.pgNumber}/${action}`);
      notify({ title: "Status Updated", message: `Tenant ${action}d.`, success: true });
      closeStatus();
      load();
    } catch {
      notify({ title: "Error!", message: "Failed to update status.", success: false, error: true });
    }
  };

  const handleClosePay = () => {
    setForm(prev => ({ ...prev, paymentMode: "", paymentAmount: "" }));
    setUpiId("");
    setUtr("");
    setShowQr(false);
    setIsVerifying(false);
    setIsPaid(false);
    closePay();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSelectedRoom(null);
    setBeds([]);
    setForm({ studentName: "", mobileNumber: "", email: "", dob: "", address: "", fatherName: "", fatherMobile: "", fatherEmail: "", motherName: "", motherMobile: "", motherEmail: "", guardianName: "", guardianMobile: "", guardianEmail: "", roomId: "", bedId: "", paymentAmount: "", paymentMode: "CASH", rentStartDate: "", rentEndDate: "" });
    navigate("/tenants");
  };

  // ================== FILTER ==================
  const filteredItems = items.filter(t => {
    if (activeTab === "awaiting" && t.status !== "NOT_APPROVED") return false;
    if (activeTab === "active" && t.status !== "ACTIVE") return false;
    if (activeTab === "notifications") {
      if (t.status !== "ACTIVE") return false;
      const hasPendingRent = payments.some(p => p.tenantPgNumber === t.pgNumber && p.paymentType === "RENT" && p.status === "PENDING");
      if (!hasPendingRent) return false;
    }

    if (!debouncedSearch.trim()) return true;
    const text = debouncedSearch.toLowerCase();
    return (
      t.studentName?.toLowerCase().includes(text) ||
      t.pgNumber?.toLowerCase().includes(text) ||
      t.mobileNumber?.toLowerCase().includes(text)
    );
  });

  const awaitingColumns = [
    { header: "PG No", key: "pgNumber", render: (val) => <strong>{val}</strong> },
    { header: "Name", key: "studentName", render: (val) => <strong>{val}</strong> },
    {
      header: "Advance Amount", key: "pgNumber", render: (val) => {
        const advPay = payments.find(p => p.tenantPgNumber === val && p.paymentType === "ADVANCE");
        return advPay ? <strong style={{ color: "#6366f1" }}>₹{advPay.advancePaymentAmount || advPay.amount}</strong> : <Text c="dimmed" size="xs">—</Text>;
      }
    },
    {
      header: "Payment Status", key: "pgNumber", render: (val) => {
        const advPay = payments.find(p => p.tenantPgNumber === val && p.paymentType === "ADVANCE");
        if (!advPay) return <Badge color="gray">No Record</Badge>;
        return <Badge color={advPay.status === "PENDING" ? "orange" : "green"}>{advPay.status === "PENDING" ? "Not Paid" : "Paid"}</Badge>;
      }
    },
    {
      header: "Approval Status", key: "pgNumber", render: (val) => {
        const advPay = payments.find(p => p.tenantPgNumber === val && p.paymentType === "ADVANCE");
        if (!advPay) return <Text c="dimmed" size="xs">—</Text>;
        return <Badge color={advPay.status === "APPROVED" ? "green" : "red"}>{advPay.status === "APPROVED" ? "Approved" : "Not Approved"}</Badge>;
      }
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, t) => (
        <Group gap="xs" justify="center">
          <Button variant="light" color="yellow" size="compact-xs" onClick={() => handleEdit(t)}>Edit</Button>
          <Button variant="light" color="red" size="compact-xs" onClick={() => openStatusModal(t)}>Deactivate</Button>
        </Group>
      )
    }
  ];

  const activeColumns = [
    { header: "PG No", key: "pgNumber", render: (val) => <strong>{val}</strong> },
    { header: "Name", key: "studentName", render: (val) => <strong>{val}</strong> },
    { header: "Monthly Rent", key: "monthlyRent", render: (val) => val ? <strong style={{ color: "#6366f1" }}>₹{val}</strong> : <Text c="dimmed" size="xs">—</Text> },
    {
      header: "Pending Rent", key: "pgNumber", render: (val) => {
        const rentPay = payments.find(p => p.tenantPgNumber === val && p.paymentType === "RENT" && p.status === "PENDING");
        if (!rentPay) return <Badge color="gray" variant="outline">None</Badge>;
        return <strong style={{ color: "#ca8a04" }}>₹{rentPay.rentAmount}</strong>;
      }
    },
    {
      header: "Rent Payment Status", key: "pgNumber", render: (val) => {
        const rentPay = payments.find(p => p.tenantPgNumber === val && p.paymentType === "RENT");
        if (!rentPay) return <Badge color="gray">No Record</Badge>;
        return <Badge color={rentPay.status === "PENDING" ? "orange" : "green"}>{rentPay.status === "PENDING" ? "Not Paid" : "Paid"}</Badge>;
      }
    },
    {
      header: "Approval Status", key: "pgNumber", render: (val) => {
        const rentPay = payments.find(p => p.tenantPgNumber === val && p.paymentType === "RENT");
        if (!rentPay) return <Text c="dimmed" size="xs">—</Text>;
        return <Badge color={rentPay.status === "APPROVED" ? "green" : "red"}>{rentPay.status === "APPROVED" ? "Approved" : "Not Approved"}</Badge>;
      }
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, t) => (
        <Group gap="xs" justify="center">
          <Button variant="light" color="yellow" size="compact-xs" onClick={() => handleEdit(t)}>Edit</Button>
          <Button variant="light" color="red" size="compact-xs" onClick={() => openStatusModal(t)}>Deactivate</Button>
        </Group>
      )
    }
  ];

  const notificationColumns = [
    { header: "PG No", key: "pgNumber", render: (val) => <strong>{val}</strong> },
    { header: "Name", key: "studentName", render: (val) => <strong>{val}</strong> },
    {
      header: "Payment Month", key: "pgNumber", render: (val) => {
        const rentPay = payments.find(p => p.tenantPgNumber === val && p.paymentType === "RENT" && p.status === "PENDING");
        return rentPay ? <Badge color="blue" variant="light">{rentPay.paymentMonth} {rentPay.paymentYear}</Badge> : null;
      }
    },
    {
      header: "Rent Amount Due", key: "pgNumber", render: (val) => {
        const rentPay = payments.find(p => p.tenantPgNumber === val && p.paymentType === "RENT" && p.status === "PENDING");
        return rentPay ? <strong style={{ color: "#ca8a04", fontSize: "16px" }}>₹{rentPay.rentAmount}</strong> : null;
      }
    },
    {
      header: "Action", key: "actions", render: (_, t) => (
        <Group gap="xs" justify="center">
          <Button variant="light" color="indigo" size="compact-xs" onClick={() => navigate("/payments")}>Pay Now</Button>
        </Group>
      )
    }
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2> Tenant Management</h2>
        {!isCreateMode ? (
          <Group>
            <Button onClick={() => navigate("/tenants/create")}>
              <IconPlus size={18} style={{ marginRight: "5px" }} /> Register New Tenant
            </Button>
          </Group>
        ) : (
          <Button onClick={() => navigate("/tenants")} variant="outline" leftSection={<IconArrowLeft size={18} />}>
            Back
          </Button>
        )}
      </div>

      {/* -------- REGISTRATION FORM -------- */}
      {isCreateMode ? (
        <div className="form-card">
          <Group gap="sm" mb="xl">
            {editingId ? <IconEdit size={24} color="#3f92c5" /> : <IconUserPlus size={24} color="#3f92c5" />}
            <h3 style={{ margin: 0 }}>{editingId ? "Edit Tenant" : "Register New Tenant"}</h3>
          </Group>

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
              <Grid.Col span={12} mt="sm">
                <Group gap={8}>
                  <IconBed size={20} color="#3f92c5" />
                  <Text fw={600} size="sm" c="blue">Room Allocation</Text>
                </Group>
              </Grid.Col>
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
              <Grid.Col span={12} mt="sm">
                <Group gap={8}>
                  <IconUsers size={20} color="#3f92c5" />
                  <Text fw={600} size="sm" c="blue">Guardian Details (at least one required)</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput label="Father Name" value={form.fatherName} onChange={e => setForm({ ...form, fatherName: e.target.value })} />
                <TextInput label="Father Mobile" mt="xs" value={form.fatherMobile} onChange={e => setForm({ ...form, fatherMobile: e.target.value })} />
                <TextInput label="Father Email" mt="xs" value={form.fatherEmail} onChange={e => setForm({ ...form, fatherEmail: e.target.value })} />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput label="Mother Name" value={form.motherName} onChange={e => setForm({ ...form, motherName: e.target.value })} />
                <TextInput label="Mother Mobile" mt="xs" value={form.motherMobile} onChange={e => setForm({ ...form, motherMobile: e.target.value })} />
                <TextInput label="Mother Email" mt="xs" value={form.motherEmail} onChange={e => setForm({ ...form, motherEmail: e.target.value })} />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput label="Guardian Name" value={form.guardianName} onChange={e => setForm({ ...form, guardianName: e.target.value })} />
                <TextInput label="Guardian Mobile" mt="xs" value={form.guardianMobile} onChange={e => setForm({ ...form, guardianMobile: e.target.value })} />
                <TextInput label="Guardian Email" mt="xs" value={form.guardianEmail} onChange={e => setForm({ ...form, guardianEmail: e.target.value })} />
              </Grid.Col>

              {/* Advance Payment Details - Only for Registration */}
              {!editingId && (
                <>
                  <Grid.Col span={12} mt="sm">
                    <Group gap={8}>
                      <IconCreditCard size={20} color="#3f92c5" />
                      <Text fw={600} size="sm" c="blue">Advance Payment Details</Text>
                    </Group>
                  </Grid.Col>

                  <Grid.Col span={12}>
                    <TextInput
                      label="Advance Amount (₹) *"
                      placeholder="Enter Advance Amount"
                      type="number"
                      value={form.paymentAmount || ''}
                      onChange={(e) => setForm({ ...form, paymentAmount: e.target.value })}
                      required
                    />
                  </Grid.Col>
                </>
              )}


            </Grid>

            <Group justify="center" mt="xl">
              <Button type="submit">
                {editingId ? "Update Tenant" : "Register Tenant"}
              </Button>
              {editingId && <Button variant="outline" color="gray" onClick={cancelEdit}>Cancel</Button>}
            </Group>
          </form>
        </div>
      ) : (
        <div>
          <Tabs value={activeTab} onChange={setActiveTab} mb="md">
            <Tabs.List>
              <Tabs.Tab value="awaiting">
                <Group gap={6}>
                  <span>Awaiting Activation</span>
                  <span style={{ background: '#f59e0b', color: '#fff', borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '1px 8px', minWidth: 20, textAlign: 'center' }}>
                    {counts.awaiting}
                  </span>
                </Group>
              </Tabs.Tab>
              <Tabs.Tab value="active">
                <Group gap={6}>
                  <span>Active Residents</span>
                  <span style={{ background: '#10b981', color: '#fff', borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '1px 8px', minWidth: 20, textAlign: 'center' }}>
                    {counts.active}
                  </span>
                </Group>
              </Tabs.Tab>
              <Tabs.Tab value="notifications">
                <Group gap={6}>
                  <span>Rent Notifications</span>
                  <span style={{ background: '#3f92c5', color: '#fff', borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '1px 8px', minWidth: 20, textAlign: 'center' }}>
                    {counts.notifications}
                  </span>
                </Group>
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          <DataTable
            title={activeTab === "awaiting" ? "Awaiting Activation" : activeTab === "notifications" ? "Rent Notifications" : "Active Residents"}
            columns={activeTab === "awaiting" ? awaitingColumns : activeTab === "notifications" ? notificationColumns : activeColumns}
            data={items}
            loading={loading}
            search={search}
            onSearch={setSearch}
            totalCount={totalCount}
            page={page}
            totalPages={Math.ceil(totalCount / pageSize)}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Status Confirmation Modal */}
      <Modal opened={statusOpened} onClose={closeStatus} title="Update Tenant Status" styles={{
        title: {
          fontSize: "18px",
          fontWeight: 600,
        },
      }} centered>
        <Text size="sm">
          Are you sure you want to <strong>{selectedItem?.status === "ACTIVE" ? "deactivate" : "activate"}</strong> tenant <strong>{selectedItem?.studentName}</strong>?
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="gray" onClick={closeStatus}>Cancel</Button>
          <Button color={selectedItem?.status === "ACTIVE" ? "red" : "green"} onClick={confirmToggleStatus}>
            {selectedItem?.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </Button>
        </Group>
      </Modal>

    </div>
  );
};

export default Tenants;
