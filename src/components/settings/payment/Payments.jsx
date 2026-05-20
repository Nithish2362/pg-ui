import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Button, TextInput, Select, Text, Group, Badge, Textarea, Tabs, ThemeIcon, Stack, Paper, Divider, Center, FileInput, ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowLeft, IconPlus, IconHome, IconHeart, IconPrinter, IconCheck, IconQrcode, IconDeviceMobile, IconCash, IconUser, IconCurrencyRupee, IconNote, IconBuildingCommunity, IconUpload, IconEye, IconTrash } from "@tabler/icons-react";
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
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        color: "#1a1a1a",
        padding: "5px",
        background: "#fff",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", color: "#c5a059", display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconBuildingCommunity size={32} color="#c5a059" />
            <span style={{
              fontWeight: 900,
              fontSize: '1.5rem',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(to right, #c5a059, #1a1a1a)',
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
            <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px" }}>{receipt.receiptNo}</p>
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
              ["Payment Date", receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleDateString('en-GB') : ""],
              ["Received By", receipt.staffRole ? <><strong style={{ color: '#1e293b', textTransform: 'uppercase' }}>{receipt.staffRole}</strong> {receipt.staffUsername ? `(${receipt.staffUsername})` : ""}</> : "-"],
              ["Name", receipt.staffName || "-"],
              ["PG", receipt.staffBuildingName || "-"],
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
      <div style={{ background: "#f8fafc", borderRadius: "12px", marginBottom: "4px" }}>
        <h3 style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>Payment Details</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {[
              ["Amount Paid", `₹${receipt.amount}`],
              ["Payment Mode", receipt.paymentMode],
              ["Status", receipt.status],
              receipt.transactionId && ["Transaction ID", receipt.transactionId],
              ["Remarks", receipt.remarks || "—"],
            ].filter(Boolean).map(([label, value]) => (
              <tr key={label}>
                <td style={{ padding: "6px 0", color: "#64748b", width: "40%" }}>{label}</td>
                <td style={{ padding: "6px 0", fontWeight: label === "Amount Paid" ? "bold" : 500, fontSize: label === "Amount Paid" ? "18px" : "14px", color: label === "Amount Paid" ? "#c5a059" : "#1a1a1a" }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px", margin: 0 }}>
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
  const currentUser = JSON.parse(localStorage.getItem('user') || "{}");
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

  const bldName = buildings.find(b => b.buildingId === currentUser?.buildingId)?.buildingName;
  const navigate = useNavigate();
  const locationState = useLocation();
  const isCreateMode = locationState.pathname === "/payments/create";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [selectedTenantRent, setSelectedTenantRent] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const receiptRef = useRef();

  // Filters
  const [filterLoc, setFilterLoc] = useState(null);
  const [filterBld, setFilterBld] = useState(null);

  // Payment Flow State
  const [screenshotBase64, setScreenshotBase64] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
    setScreenshotBase64("");
    setIsPaid(false);
    navigate("/payments");
  };

  const save = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const amt = Number(form.amount);
      const isRent = form.paymentType === "MONTHLY_RENT";
      const status = amt === 0 ? "PENDING" : "UNAPPROVED";
      const receiptNo = amt > 0 ? `RECEIPT-${Date.now().toString().slice(-6)}` : "";

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
      if (form.paymentMode === 'ONLINE') {
        if (!form.transactionId || !screenshotBase64) {
          notify({ title: 'Validation Error', message: 'Transaction ID and Screenshot are required', error: true });
          return;
        }
        payload.transactionId = form.transactionId;
        payload.screenshotUrl = screenshotBase64;
      }

      await (form.paymentId
        ? api.put(`/admin/payments/${form.paymentId}`, payload)
        : api.post(`/admin/payments?tenantId=${form.tenantId}`, payload));

      notify({ title: "Success", message: "Payment recorded successfully", success: true });
      setIsPaid(true);
      load();
    } catch (err) {
      notify({ title: "Error", message: err?.response?.data?.message || "Unable to save payment", error: true });
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

  const shareReceipt = async (paymentId, target, type) => {
    try {
      await api.post(`/admin/payments/${paymentId}/share?target=${target}&type=${type}`);
      notify({
        title: "Success",
        message: `Receipt shared with ${target} via ${type.toUpperCase()}`,
        success: true
      });
    } catch (err) {
      notify({
        title: "Error",
        message: err.response?.data?.message || "Failed to share receipt",
        error: true
      });
    }
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
    { header: "Tenant Name", key: "tenantName", render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { header: "Tenant ID", key: "tenantPgNumber", render: (val) => <span style={{ color: "#64748b", fontSize: "12px" }}>{val}</span> },
    { header: "Amount", key: "amount", render: (val) => <strong style={{ color: "#c5a059", fontSize: "16px" }}>₹{val}</strong> },
    { header: "Date", key: "paymentDate" },
    {
      header: "Mode", key: "paymentMode", render: (val) => (
        <span style={{ background: "#f5f5f5", color: "#1a1a1a", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700 }}>
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
            <>
              <ActionIcon variant="light" color="brand" onClick={() => openReceipt(p)}><IconEye size={18} /></ActionIcon>
              <Button variant="filled" color="green" size="compact-xs" onClick={() => approvePayment(p)}>Approve</Button>
            </>
          )}
          {activeTab === "PENDING" && <Button variant="filled" color="yellow" size="compact-xs" onClick={() => handlePayBalance(p)}>Pay Now</Button>}
          {activeTab === "APPROVED" && <ActionIcon variant="light" color="brand" onClick={() => openReceipt(p)}><IconEye size={18} /></ActionIcon>}
        </Group>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <Group align="center" gap="xs">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconCurrencyRupee size={28} color="var(--gold)" />
            Financial Ledger
          </h2>
          {!isCreateMode && (
            <Group gap="xs">
               <div className="slide-left first-select">
              <Select
                placeholder="Select Location"
                data={locations.map(l => ({ value: l.locationId, label: l.locationName }))}
                value={filterLoc}
                onChange={val => { setFilterLoc(val); setFilterBld(null); setPage(1); }}
                clearable
                size="md"
                variant="filled"
                style={{ width: '180px' }}
              />
              </div>
               <div className="slide-left second-select">
              <Select
                placeholder="Select Building"
                data={buildings.filter(b => !filterLoc || b.locationId === filterLoc).map(b => ({ value: b.buildingId, label: b.buildingName }))}
                value={filterBld}
                onChange={val => { setFilterBld(val); setPage(1); }}
                clearable
                disabled={!filterLoc}
                size="md"
                variant="filled"
                style={{ width: '180px' }}
              />
              </div>
            </Group>
          )}
        </Group>
        <Button leftSection={<IconPlus size={18} />} onClick={() => navigate("/payments/create")} size="sm">Record Payment</Button>
      </div>

      <Tabs value={activeTab} onChange={setActiveTab} mb="md">
        <Tabs.List>
          <Tabs.Tab value="PENDING" color="brand">Pending <Badge variant="filled" ml={5} size="sm">{counts.PENDING || 0}</Badge></Tabs.Tab>
          <Tabs.Tab value="UNAPPROVED" color="brand">Unapproved <Badge variant="filled" ml={5} size="sm">{counts.UNAPPROVED || 0}</Badge></Tabs.Tab>
          <Tabs.Tab value="APPROVED" color="brand">Approved <Badge variant="filled" ml={5} size="sm">{counts.APPROVED || 0}</Badge></Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Tabs value={activeSection} onChange={setActiveSection} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="ADVANCE">
            Advance Payments <Badge variant="filled" ml={5} size="sm" color="brand">{activeTab === 'PENDING' ? counts.ADVANCE_PENDING : activeTab === 'UNAPPROVED' ? counts.ADVANCE_UNAPPROVED : counts.ADVANCE_APPROVED || 0}</Badge>
          </Tabs.Tab>
          <Tabs.Tab value="RENT">
            Rent Payments <Badge variant="filled" ml={5} size="sm" color="brand">{activeTab === 'PENDING' ? counts.RENT_PENDING : activeTab === 'UNAPPROVED' ? counts.RENT_UNAPPROVED : counts.RENT_APPROVED || 0}</Badge>
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

      <Modal opened={isCreateMode} onClose={handleCloseCreateModal} title="Record New Payment" size="lg" centered padding="xl">
        {!isPaid ? (
          <Stack gap="lg">
            {selectedTenantRent && (
              <Paper p="md" radius="md" withBorder bg="indigo.0">
                <Group justify="space-between">
                  <Text size="sm" fw={600}>Monthly Rent Information</Text>
                  <Text fw={700} color="indigo">₹{selectedTenantRent}</Text>
                </Group>
              </Paper>
            )}

            <Select
              label="Select Tenant"
              placeholder="Search by name or PG ID"
              leftSection={<IconUser size={18} />}
              leftSectionPointerEvents="none"
              data={tenants
                .filter(t => locationState.state?.tenantId ? String(t.id) === String(locationState.state.tenantId) : true)
                .map(t => ({ value: String(t.id), label: `${t.pgNumber} – ${t.studentName}` }))}
              value={form.tenantId}
              onChange={(val) => {
                setForm({ ...form, tenantId: val });
                const tenant = tenants.find(t => String(t.id) === val);
                setSelectedTenantRent(tenant?.monthlyRent || null);
              }}
              searchable
              required
              disabled={!!locationState.state?.tenantId}
              comboboxProps={{ withinPortal: true, zIndex: 10000 }}
              styles={{ input: { paddingLeft: '40px' } }}
            />

            <Group grow>
              <Select
                label="Payment Mode"
                leftSection={form.paymentMode === 'CASH' ? <IconCash size={18} /> : <IconQrcode size={18} />}
                leftSectionPointerEvents="none"
                data={[{ value: 'CASH', label: 'Cash' }, { value: 'ONLINE', label: 'Online' }]}
                value={form.paymentMode}
                onChange={(val) => setForm({ ...form, paymentMode: val })}
                required
                comboboxProps={{ withinPortal: true, zIndex: 10000 }}
                styles={{ input: { paddingLeft: '40px' } }}
              />
              <Select
                label="Payment Type"
                data={[{ value: 'MONTHLY_RENT', label: 'Monthly Rent' }, { value: 'SECURITY_ADVANCE', label: 'Security Advance' }]}
                value={form.paymentType}
                onChange={(val) => setForm({ ...form, paymentType: val })}
                required
                disabled
                styles={{ input: { opacity: 1, backgroundColor: '#f8f9fa' } }}
              />
            </Group>

            <TextInput
              label="Amount (₹)"
              placeholder="Enter amount"
              leftSection={<IconCurrencyRupee size={18} />}
              leftSectionPointerEvents="none"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              disabled={!!form.paymentId || (form.paymentType === 'MONTHLY_RENT' && !!selectedTenantRent)}
              styles={{ input: { paddingLeft: '40px' } }}
            />

            {form.paymentMode === 'ONLINE' && (
              <>
                <TextInput
                  label="UPI Transaction ID"
                  placeholder="Enter 12-digit ID"
                  leftSection={<IconDeviceMobile size={18} />}
                  leftSectionPointerEvents="none"
                  value={form.transactionId || ''}
                  onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                  required
                  styles={{ input: { paddingLeft: '40px' } }}
                />
                <FileInput
                  label="Upload Screenshot"
                  placeholder="Select image"
                  leftSection={<IconUpload size={18} />}
                  leftSectionPointerEvents="none"
                  onChange={(file) => {
                    if (!file) return;
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => setScreenshotBase64(reader.result);
                  }}
                  required
                  styles={{ input: { paddingLeft: '40px' } }}
                />
              </>
            )}

            <Textarea
              label="Remarks (Optional)"
              placeholder="Add any notes..."
              leftSection={<IconNote size={18} />}
              leftSectionPointerEvents="none"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              styles={{ input: { paddingLeft: '40px' } }}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="outline" color="gray" onClick={handleCloseCreateModal}>Cancel</Button>
              <Button onClick={() => save()} disabled={!form.amount || !form.tenantId}>Confirm Payment</Button>
            </Group>
          </Stack>
        ) : (
          <Center style={{ flexDirection: 'column', height: '300px' }}>
            <ThemeIcon size={80} radius="xl" color="green" variant="light" mb="xl"><IconCheck size={40} /></ThemeIcon>
            <Text fw={800} size="xl">Payment Successful!</Text>
            <Button mt="xl" onClick={handleCloseCreateModal}>Close</Button>
          </Center>
        )}
      </Modal>

      <Modal opened={opened} onClose={close} title="Delete Payment" centered>
        <Text size="sm">Are you sure you want to delete this payment record?</Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="gray" onClick={close}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>

      <Modal opened={showReceipt} onClose={() => setShowReceipt(false)} size="lg">
        <Stack>
          <PaymentReceipt receipt={selectedReceipt} ref={receiptRef} />
          <Group justify="center" >
            {selectedReceipt?.status === 'APPROVED' && <Button size="sm" leftSection={<IconPrinter size={20} />} onClick={printReceipt}>Print</Button>}
            {selectedReceipt?.screenshotUrl && (
              <>
                <Button size="sm" color="teal" onClick={() => setShowScreenshot(true)}>View Screenshot</Button>
                <Button 
                  size="sm" 
                  color="blue" 
                  component="a" 
                  href={selectedReceipt.screenshotUrl} 
                  download={`receipt_${selectedReceipt.receiptNo || 'screenshot'}.png`}
                >
                  Download Screenshot
                </Button>
              </>
            )}
          </Group>
          <Divider my="sm" label="Share Receipt" labelPosition="center" />
          <Group justify="center" gap="xs">
            <Button size="xs" variant="outline" color="dark" onClick={() => shareReceipt(selectedReceipt.id, 'tenant', 'email')}>Email Tenant</Button>
            <Button size="xs" variant="outline" color="dark" onClick={() => shareReceipt(selectedReceipt.id, 'tenant', 'sms')}>SMS Tenant</Button>
            <Button size="xs" variant="outline" color="dark" onClick={() => shareReceipt(selectedReceipt.id, 'parent', 'email')}>Email Parents</Button>
            <Button size="xs" variant="outline" color="dark" onClick={() => shareReceipt(selectedReceipt.id, 'parent', 'sms')}>SMS Parents</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={showScreenshot} onClose={() => setShowScreenshot(false)} size="xl" title="Payment Screenshot">
        {selectedReceipt?.screenshotUrl && (
          <Stack>
            <img src={selectedReceipt.screenshotUrl} alt="Screenshot" style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: '70vh' }} />
            <Group justify="center">
              <Button 
                size="sm" 
                color="blue" 
                component="a" 
                href={selectedReceipt.screenshotUrl} 
                download={`receipt_${selectedReceipt.receiptNo || 'screenshot'}.png`}
              >
                Download Image
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  );
};

export default Payments;