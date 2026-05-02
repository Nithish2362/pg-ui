import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Button, TextInput, Select, Text, Group, Badge, Textarea, Tabs, ThemeIcon, Stack, Paper, Divider, Center } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowLeft, IconPlus, IconHome, IconHeart, IconPrinter, IconCheck, IconQrcode, IconDeviceMobile, IconCash, IconUser, IconCurrencyRupee, IconNote, IconBuildingCommunity } from "@tabler/icons-react";
import api from "../../../api/Interceptor";
import notify from "../../utils/Notification";
import DataTable from "../../common/DataTable";
import useDebounce from "../../../common/useDebounce";

// ============================================================
// PaymentReceipt – printable component (ref forwarded)
// ============================================================
const PaymentReceipt = React.forwardRef(({ receipt }, ref) => {
  if (!receipt) return null;
  return (
    <div
      ref={ref}
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        color: "#1e293b",
        background: "#fff",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", color: "#3f92c5", display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconBuildingCommunity size={32} color="#3f92c5" />
            <span style={{
              fontWeight: 900,
              fontSize: '1.5rem',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(to right, #3f92c5, #13415a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              STAYWOW
            </span>
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>Payment Receipt</p>
        </div>
        <div style={{ textAlign: "right" }}>
          {receipt.receiptNo && (
            <>
              <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px" }}>{receipt.receiptNo}</p>
            </>
          )}
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>{receipt.paymentDate}</p>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "2px solid #e2e8f0", margin: "24px 0" }} />

      {/* Tenant Details */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>Tenant Details</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {[
              ["Tenant Name", receipt.tenantName],
              ["PG Number", receipt.tenantPgNumber],
              ["Payment Month", `${receipt.paymentMonth} ${receipt.paymentYear}`],
            ].map(([label, value]) => (
              <tr key={label}>
                <td style={{ padding: "6px 0", color: "#64748b", width: "40%" }}>{label}</td>
                <td style={{ padding: "6px 0", fontWeight: 500 }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Details */}
      <div style={{ background: "#f8fafc", borderRadius: "12px", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>Payment Details</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {[
              ["Amount Paid", `₹${receipt.amount}`],
              ["Payment Mode", receipt.paymentMode],
              ["Status", receipt.status],
              ["Remarks", receipt.remarks || "—"],
            ].map(([label, value]) => (
              <tr key={label}>
                <td style={{ padding: "6px 0", color: "#64748b", width: "40%" }}>{label}</td>
                <td style={{ padding: "6px 0", fontWeight: label === "Amount Paid" ? "bold" : 500, fontSize: label === "Amount Paid" ? "18px" : "14px", color: label === "Amount Paid" ? "#6366f1" : "#1e293b" }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px", margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
        Thank you for your payment !
      </p>
    </div>
  );
});

// ============================================================
// Main Payments Component
// ============================================================
const STATUS_CONFIG = {
  PAID: { bg: "#dcfce7", color: "#16a34a", label: "PAID" },
  "PARTIALLY PAID": { bg: "#fef9c3", color: "#ca8a04", label: "PARTIALLY PAID" },
  PENDING: { bg: "#fce7f3", color: "#db2777", label: "PENDING" },
  "NOT PAID": { bg: "#fee2e2", color: "#dc2626", label: "NOT PAID" },
  APPROVED: { bg: "#dcfce7", color: "#16a34a", label: "APPROVED" },
  UNAPPROVED: { bg: "#fef9c3", color: "#ca8a04", label: "UNAPPROVED" },
};

const Payments = () => {
  const emptyForm = {
    paymentId: null,
    tenantId: "",
    amount: "",
    paymentMode: "CASH",
    paymentType: "MONTHLY_RENT",
    remarks: "",
  };

  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [locations, setLocations] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const navigate = useNavigate();
  const locationState = useLocation();
  const isCreateMode = locationState.pathname === "/payments/create";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTenantRent, setSelectedTenantRent] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const receiptRef = useRef();

  // Filters
  const [filterLoc, setFilterLoc] = useState(null);
  const [filterBld, setFilterBld] = useState(null);

  // Payment Flow State
  const [upiId, setUpiId] = useState("");
  const [utr, setUtr] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState({ PENDING: 0, UNAPPROVED: 0, APPROVED: 0, ADVANCE_PENDING: 0, RENT_PENDING: 0 });
  const debouncedSearch = useDebounce(search, 500);

  const [activeSection, setActiveSection] = useState("ADVANCE");
  const [activeTab, setActiveTab] = useState("PENDING");

  useEffect(() => {
    const params = new URLSearchParams(locationState.search);
    const tab = params.get("tab");
    const section = params.get("section");
    const s = params.get("search");
    if (tab) setActiveTab(tab.toUpperCase());
    if (section) setActiveSection(section.toUpperCase());
    if (s) setSearch(s);
  }, [locationState.search]);

  const printReceipt = useReactToPrint({ contentRef: receiptRef });

  const loadMasters = async () => {
    try {
      const [locRes, bldRes] = await Promise.all([
        api.get("/admin/locations/get-all"),
        api.get("/admin/buildings")
      ]);
      setLocations(locRes.data?.response || []);
      setBuildings(bldRes.data?.response || []);
    } catch (err) { console.error(err); }
  };

  const load = async () => {
    try {
      setLoading(true);
      let url = `/admin/payments/view?page=${page - 1}&pageSize=${pageSize}&status=${activeTab}&searchTerm=${debouncedSearch}`;
      if (filterLoc) url += `&locationId=${filterLoc}`;
      if (filterBld) url += `&buildingId=${filterBld}`;

      let countsUrl = `/admin/payments/counts`;
      const cParams = [];
      if (filterLoc) cParams.push(`locationId=${filterLoc}`);
      if (filterBld) cParams.push(`buildingId=${filterBld}`);
      if (cParams.length > 0) countsUrl += `?${cParams.join('&')}`;

      const [paymentRes, tenantRes, countsRes] = await Promise.all([
        api.get(url),
        api.get("/admin/tenants"),
        api.get(countsUrl)
      ]);

      setPayments(paymentRes.data?.response || []);
      setTotalCount(paymentRes.data?.count || 0);
      setTenants(tenantRes.data?.response || tenantRes.data?.data || tenantRes.data || []);
      setCounts(countsRes.data?.response || {});
    } catch (err) {
      notify({ title: "Error", message: "Failed to load data", error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMasters(); }, []);
  useEffect(() => { load(); }, [page, activeTab, debouncedSearch, pageSize, filterLoc, filterBld]);

  // Handle auto-fill when navigating from "Pay Balance" or "Unpaid"
  useEffect(() => {
    if (isCreateMode && locationState.state) {
      const { paymentId, tenantId, amount, rent, paymentType } = locationState.state;
      if (tenantId) {
        setForm(f => ({
          ...f,
          paymentId: paymentId || null,
          tenantId: String(tenantId),
          amount: amount || "",
          paymentType: paymentType === "ADVANCE" ? "SECURITY_ADVANCE" : "MONTHLY_RENT"
        }));
        setSelectedTenantRent(rent || null);
      }
    }
  }, [isCreateMode, locationState.state]);

  const handleCloseCreateModal = () => {
    setForm(emptyForm);
    setSelectedTenantRent(null);
    setUpiId("");
    setUtr("");
    setShowQr(false);
    setIsVerifying(false);
    setIsPaid(false);
    navigate("/payments");
  };

  const save = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const amt = Number(form.amount);
      const isRent = form.paymentType === "MONTHLY_RENT";
      const status = amt === 0 ? "PENDING" : "UNAPPROVED";
      const receiptNo = amt > 0 ? `REC-PG-${Date.now().toString().slice(-6)}` : "";

      const payload = {
        amount: amt,
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMonth: new Date().toLocaleString("default", { month: "long" }),
        paymentYear: new Date().getFullYear(),
        paymentMode: form.paymentMode,
        paymentType: isRent ? "RENT" : "ADVANCE",
        remarks: isRent ? `Rent - ${form.remarks}` : `Advance - ${form.remarks}`,
        status: status,
        isApproved: false,
        receiptNo: receiptNo
      };

      await (form.paymentId
        ? api.put(`/admin/payments/${form.paymentId}`, payload)
        : api.post(`/admin/payments?tenantId=${form.tenantId}`, payload));

      notify({ title: "Success", message: "Payment recorded successfully", success: true });
      setIsPaid(true); // Show success screen
      load(); // Refresh background data
    } catch (err) {
      notify({ title: "Error", message: err?.response?.data?.message || "Unable to save payment", error: true });
      setIsVerifying(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await api.delete(`/admin/payments/${selectedItem.id}`);
      notify({ title: "Success", message: "Payment deleted", success: true });
      close();
      load();
    } catch {
      notify({ title: "Error", message: "Delete failed", error: true });
    }
  };

  const openReceipt = (p) => {
    setSelectedReceipt(p);
    setShowReceipt(true);
  };

  const approvePayment = async (p) => {
    try {
      await api.put(`/admin/payments/${p.id}`, { ...p, status: "APPROVED", isApproved: true });
      notify({ title: "Approved", message: "Payment has been approved.", success: true });
      load();
    } catch (err) {
      notify({ title: "Error", message: "Failed to approve payment.", error: true });
    }
  };

  const handlePayBalance = (p) => {
    const tenant = tenants.find(t => String(t.id) === String(p.tenantId || p.tenant?.id));
    const rent = tenant?.monthlyRent || 0;

    navigate("/payments/create", {
      state: {
        paymentId: p.id,
        tenantId: p.tenantId || p.tenant?.id,
        amount: p.paymentType === "ADVANCE" ? p.amount : (p.rentAmount || rent),
        rent: rent,
        paymentType: p.paymentType
      }
    });
  };

  const filteredPayments = payments.filter(p => p.paymentType === activeSection);

  const columns = [
    {
      header: "Tenant", key: "tenantName", render: (val, p) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>{p.tenantPgNumber}</div>
        </div>
      )
    },
    { header: "Amount", key: "amount", render: (val) => <strong style={{ color: "#6366f1", fontSize: "16px" }}>₹{val}</strong> },
    { header: "Month / Year", key: "paymentMonth", render: (val, p) => `${val} ${p.paymentYear}` },
    { header: "Date", key: "paymentDate", render: (val) => <span style={{ fontSize: "13px" }}>{val}</span> },
    {
      header: "Mode", key: "paymentMode", render: (val) => (
        <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
          {val}
        </span>
      )
    },
    {
      header: "Status", key: "status", render: (val) => {
        const cfg = STATUS_CONFIG[val] || { bg: "#f1f5f9", color: "#64748b", label: val };
        return (
          <span style={{ background: cfg.bg, color: cfg.color, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
            {cfg.label}
          </span>
        );
      }
    },
    {
      header: "Actions", key: "actions", render: (_, p) => (
        <Group gap="xs" justify="center">
          {activeTab === "UNAPPROVED" && (
            <Button variant="filled" color="green" size="compact-xs" onClick={() => approvePayment(p)}>
              Approve
            </Button>
          )}
          {activeTab === "PENDING" && (
            <Button variant="filled" color="yellow" size="compact-xs" onClick={() => handlePayBalance(p)}>
              Pay Now
            </Button>
          )}
          {activeTab === "APPROVED" && (
            <Button variant="light" color="indigo" size="compact-xs" leftSection={<IconPrinter size={14} />} onClick={() => openReceipt(p)}>
              Receipt
            </Button>
          )}
        </Group>
      )
    }
  ];

  return (
    <div>
      {/* HEADER */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'md' }}>
        <Group align="center" gap="xl">
          <h2>Payment Management</h2>
          {!isCreateMode && (
            <Group gap="sm">
              <Select
                placeholder="Select Location"
                data={locations.map(l => ({ value: l.locationId, label: l.locationName }))}
                value={filterLoc}
                onChange={val => { setFilterLoc(val); setFilterBld(null); }}
                clearable
                size="md"
                style={{ width: '220px' }}
                variant="filled"
              />
              <Select
                placeholder="Select Building"
                data={buildings.filter(b => !filterLoc || b.locationId === filterLoc).map(b => ({ value: b.buildingId, label: b.buildingName }))}
                value={filterBld}
                onChange={setFilterBld}
                clearable
                disabled={!filterLoc}
                size="md"
                style={{ width: '220px' }}
                variant="filled"
              />
            </Group>
          )}
        </Group>

        {!isCreateMode && (
          <Button onClick={() => navigate("/payments/create")} size="sm">
            <IconPlus size={18} style={{ marginRight: "5px" }} /> Record Payment
          </Button>
        )}
      </div>

      {/* TABS & TABLE */}
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        mb={0}
        styles={{
          tab: { padding: '12px 20px', fontWeight: 600 },
          list: { borderBottom: 'none' }
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="PENDING" color="yellow">
            <Group gap={8}>
              <span>Pending</span>
              <Badge variant="filled" color="yellow" size="sm">{counts.PENDING || 0}</Badge>
            </Group>
          </Tabs.Tab>
          <Tabs.Tab value="UNAPPROVED" color="blue">
            <Group gap={8}>
              <span>Unapproved</span>
              <Badge variant="filled" color="blue" size="sm">{counts.UNAPPROVED || 0}</Badge>
            </Group>
          </Tabs.Tab>
          <Tabs.Tab value="APPROVED" color="teal">
            <Group gap={8}>
              <span>Approved</span>
              <Badge variant="filled" color="teal" size="sm">{counts.APPROVED || 0}</Badge>
            </Group>
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Tabs
        value={activeSection}
        onChange={setActiveSection}
        variant="default"
        mb="xl"
      >
        <Tabs.List>
          <Tabs.Tab value="ADVANCE">
            <Group gap={8}>
              <span>Advance Payments</span>
              <Badge variant="light" color="violet" size="sm">{counts[`ADVANCE_${activeTab}`] || 0}</Badge>
            </Group>
          </Tabs.Tab>
          <Tabs.Tab value="RENT">
            <Group gap={8}>
              <span>Rent Payments</span>
              <Badge variant="light" color="cyan" size="sm">{counts[`RENT_${activeTab}`] || 0}</Badge>
            </Group>
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <DataTable
        title={`${activeTab.toLowerCase()} ${activeSection.toLowerCase()} Payments`}
        columns={columns}
        data={filteredPayments}
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

      {/* RECORD PAYMENT MODAL */}
      <Modal
        opened={isCreateMode}
        onClose={handleCloseCreateModal}
        title={<Text fw={700} size="lg">Record New Payment</Text>}
        size="lg"
        centered
        padding="xl"
        radius="md"
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <div style={{ minHeight: '400px' }}>
          {!showQr && !isPaid ? (
            <Stack gap="lg">
              {selectedTenantRent && (
                <Paper p="md" radius="md" withBorder bg="indigo.0">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <ThemeIcon variant="light" color="indigo" radius="md">
                        <IconHome size={18} />
                      </ThemeIcon>
                      <Text size="sm" fw={600}>Monthly Rent Information</Text>
                    </Group>
                    <Text fw={700} color="indigo" size="lg">₹{selectedTenantRent}</Text>
                  </Group>
                </Paper>
              )}

              <Select
                label="Select Tenant"
                placeholder="Search by name or PG ID"
                leftSection={<IconUser size={18} />}
                data={tenants.map(t => ({ value: String(t.id), label: `${t.pgNumber} – ${t.studentName}` }))}
                value={form.tenantId}
                onChange={(val) => {
                  setForm({ ...form, tenantId: val });
                  const tenant = tenants.find(t => String(t.id) === val);
                  setSelectedTenantRent(tenant?.monthlyRent || null);
                }}
                searchable
                required
              />

              <Group grow>
                <Select
                  label="Payment Mode"
                  leftSection={form.paymentMode === 'CASH' ? <IconCash size={18} /> : <IconQrcode size={18} />}
                  data={[
                    { value: 'CASH', label: 'Cash Payment' },
                    { value: 'UPI', label: 'UPI / Online' }
                  ]}
                  value={form.paymentMode}
                  onChange={(val) => setForm({ ...form, paymentMode: val })}
                  required
                />
                <Select
                  label="Payment Type"
                  data={[
                    { value: 'MONTHLY_RENT', label: 'Monthly Rent' },
                    { value: 'SECURITY_ADVANCE', label: 'Security Advance' }
                  ]}
                  value={form.paymentType}
                  onChange={(val) => {
                    const newForm = { ...form, paymentType: val };
                    if (val === 'MONTHLY_RENT' && selectedTenantRent) {
                      newForm.amount = selectedTenantRent;
                    }
                    setForm(newForm);
                  }}
                  required
                />
              </Group>

              <TextInput
                label="Amount (₹)"
                placeholder="Enter amount"
                leftSection={<IconCurrencyRupee size={18} />}
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                disabled={!!form.paymentId || (form.paymentType === 'MONTHLY_RENT' && !!selectedTenantRent)}
              />

              {form.paymentMode === 'UPI' && (
                <TextInput
                  label="Receiver UPI ID"
                  placeholder="e.g. merchant@upi"
                  leftSection={<IconDeviceMobile size={18} />}
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required
                />
              )}

              <Textarea
                label="Remarks (Optional)"
                placeholder="Add any notes..."
                leftSection={<IconNote size={18} />}
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              />

              <Divider mt="md" />

              <Group justify="flex-end">
                <Button variant="outline" color="gray" onClick={handleCloseCreateModal}>Cancel</Button>
                {form.paymentMode === 'UPI' ? (
                  <Button size="md" onClick={() => setShowQr(true)} disabled={!form.amount || !upiId || !form.tenantId} leftSection={<IconQrcode size={18} />}>
                    Generate QR
                  </Button>
                ) : (
                  <Button size="md" onClick={() => save()} disabled={!form.amount || !form.tenantId} leftSection={<IconCheck size={18} />}>
                    Confirm Cash Payment
                  </Button>
                )}
              </Group>
            </Stack>
          ) : isPaid ? (
            <Center style={{ flexDirection: 'column', height: '400px' }}>
              <ThemeIcon size={80} radius="xl" color="green" variant="light" mb="xl">
                <IconCheck size={40} />
              </ThemeIcon>
              <Text fw={800} size="xl">Payment Successful!</Text>
              <Text c="dimmed" size="sm" mt="sm" ta="center" maw={300}>
                The payment of ₹{form.amount} has been recorded and is now awaiting approval.
              </Text>
              <Button mt="xl" size="lg" onClick={handleCloseCreateModal}>Close & Refresh</Button>
            </Center>
          ) : (
            <Stack align="center" gap="xl" py="xl">
              <Paper p="xl" radius="xl" withBorder shadow="md" style={{ background: '#fff' }}>
                {isVerifying ? (
                  <Stack align="center" py="xl">
                    <div className="loading-dots">Verifying...</div>
                  </Stack>
                ) : (
                  <Stack align="center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=PG_ADMIN&am=${form.amount}&cu=INR`)}`}
                      alt="UPI QR Code"
                      style={{ width: '220px', height: '220px' }}
                    />
                    <Badge size="xl" variant="dot" color="indigo">₹{form.amount}</Badge>
                  </Stack>
                )}
              </Paper>

              {!isVerifying && (
                <Stack w="100%" gap="md">
                  <TextInput
                    label="Transaction ID / UTR"
                    placeholder="Enter 12-digit Ref No"
                    description="Enter the reference number from your UPI app"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    required
                  />
                  <Group grow>
                    <Button variant="light" color="gray" onClick={() => setShowQr(false)}>Edit Details</Button>
                    <Button
                      onClick={() => {
                        setIsVerifying(true);
                        setTimeout(() => save(), 2000);
                      }}
                      disabled={utr.length < 6}
                    >
                      Verify & Confirm
                    </Button>
                  </Group>
                </Stack>
              )}
            </Stack>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal opened={opened} onClose={close} title="Delete Payment" styles={{
        title: { fontSize: "18px", fontWeight: 600, color: "#fa5252" },
      }} centered>
        <Text size="sm">
          Are you sure you want to delete the payment of <strong>₹{selectedItem?.amount}</strong> for <strong>{selectedItem?.tenantName}</strong>? This action cannot be undone.
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="gray" onClick={close}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>

      {/* Receipt Modal */}
      <Modal opened={showReceipt} onClose={() => setShowReceipt(false)}>
        <Stack>
          <Paper>
            <PaymentReceipt receipt={selectedReceipt} ref={receiptRef} />
          </Paper>
          <Button size="sm" styles={{ width: "150px", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto" }} leftSection={<IconPrinter size={20} />} onClick={printReceipt}>Print Receipt</Button>
        </Stack>
      </Modal>
    </div>
  );
};

export default Payments;