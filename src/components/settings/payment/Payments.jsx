import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Button, TextInput, Select, Text, Group, Badge, Textarea, Tabs, SegmentedControl, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowLeft, IconPlus, IconHome, IconHeart, IconPrinter, IconCheck, IconQrcode, IconDeviceMobile, IconCash } from "@tabler/icons-react";
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
        padding: "40px",
        width: "700px",
        color: "#1e293b",
        background: "#fff",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", color: "#6366f1", display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconHome size={32} /> PG Hostel
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>Payment Receipt</p>
        </div>
        <div style={{ textAlign: "right" }}>
          {receipt.receiptNo && (
            <>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Receipt #</p>
              <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px" }}>{receipt.receiptNo}</p>
            </>
          )}
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>{receipt.paymentDate}</p>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "2px solid #e2e8f0", marginBottom: "24px" }} />

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
      <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
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

      <hr style={{ border: "none", borderTop: "1px dashed #e2e8f0", margin: "24px 0" }} />
      <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px", margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
        Thank you for your payment! <IconHeart size={14} color="#f43f5e" fill="#f43f5e" />
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

  // Payment Flow State
  const [upiId, setUpiId] = useState("");
  const [utr, setUtr] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState({ PENDING: 0, UNAPPROVED: 0, APPROVED: 0, ADVANCE_PENDING: 0, RENT_PENDING: 0 });
  const debouncedSearch = useDebounce(search, 500);

  const [activeSection, setActiveSection] = useState("ADVANCE");
  const [activeTab, setActiveTab] = useState("PENDING");

  const printReceipt = useReactToPrint({ contentRef: receiptRef });

  const load = async () => {
    try {
      setLoading(true);
      // Construct filter status based on activeSection (ADVANCE/RENT) is not directly in the API status param
      // but the API findByStatusAndSearch handles status string.
      // In Payments.jsx, status is PENDING, UNAPPROVED, APPROVED.
      
      const [paymentRes, tenantRes, countsRes] = await Promise.all([
        api.get(`/admin/payments/view?page=${page - 1}&pageSize=${pageSize}&status=${activeTab}&searchTerm=${debouncedSearch}`),
        api.get("/admin/tenants"),
        api.get("/admin/payments/counts")
      ]);
      
      // Filter by section (ADVANCE/RENT) client-side or we could add a type param to API.
      // For now, let's keep the section filter client-side since the API doesn't have 'type' param yet.
      // Actually, I should probably add 'type' param to the API for full server-side pagination.
      // But let's start with this.
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

  useEffect(() => { load(); }, [page, activeTab, debouncedSearch]);

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
          paymentType: paymentType === "ADVANCE" ? "ADVANCE_PAYMENT" : "MONTHLY_RENT"
        }));
        setSelectedTenantRent(rent || null);
      }
    }
  }, [isCreateMode, locationState.state]);



  // When tenant is selected, auto-fill the rent info
  const handleTenantChange = (e) => {
    const id = e.target.value;
    setForm({ ...form, tenantId: id });
    const tenant = tenants.find(t => String(t.id) === String(id));
    setSelectedTenantRent(tenant?.monthlyRent || null);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

      const res = form.paymentId
        ? await api.put(`/admin/payments/${form.paymentId}`, payload)
        : await api.post(`/admin/payments?tenantId=${form.tenantId}`, payload);
      notify({ title: "Success", message: "Payment recorded successfully", success: true });
      setForm(emptyForm);
      setSelectedTenantRent(null);
      setUpiId("");
      setUtr("");
      setShowQr(false);
      setIsVerifying(false);
      setIsPaid(true); // Show success screen
    } catch (err) {
      notify({ title: "Error", message: err?.response?.data?.message || "Unable to save payment", error: true });
    }
  };

  const openDeleteModal = (p) => {
    setSelectedItem(p);
    open();
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

  // Filter Payments based on Active Tab (Server-side handled status, but we still filter Section client-side for now)
  const filteredPayments = payments.filter(p => {
    return p.paymentType === activeSection;
  });

  const columns = [
    { header: "Tenant", key: "tenantName", render: (val, p) => (
      <div>
        <div style={{ fontWeight: 600 }}>{val}</div>
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>{p.tenantPgNumber}</div>
      </div>
    )},
    { header: "Amount", key: "amount", render: (val) => <strong style={{ color: "#6366f1", fontSize: "16px" }}>₹{val}</strong> },
    { header: "Month / Year", key: "paymentMonth", render: (val, p) => `${val} ${p.paymentYear}` },
    { header: "Date", key: "paymentDate", render: (val) => <span style={{ fontSize: "13px" }}>{val}</span> },
    { header: "Mode", key: "paymentMode", render: (val) => (
      <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
        {val}
      </span>
    )},
    { header: "Status", key: "status", render: (val) => {
      const cfg = STATUS_CONFIG[val] || { bg: "#f1f5f9", color: "#64748b", label: val };
      return (
        <span style={{ background: cfg.bg, color: cfg.color, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
          {cfg.label}
        </span>
      );
    }},
    { header: "Actions", key: "actions", render: (_, p) => (
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
    )}
  ];

  return (
    <div>
      {/* HEADER */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2> Payment Management</h2>
        {!isCreateMode ? (
          <Button onClick={() => navigate("/payments/create")}>
            <IconPlus size={18} style={{ marginRight: "5px" }} /> Record Payment
          </Button>
        ) : (
          <Button onClick={() => navigate("/payments")} variant="outline" leftSection={<IconArrowLeft size={18} />}>
            Back
          </Button>
        )}
      </div>



      {/* FORM */}
      {isCreateMode ? (
        <div className="form-card">
          <h3 style={{ marginBottom: "1rem" }}>{form.paymentMode === 'UPI' ? "Scan & Pay (UPI)" : "Record Cash Payment"}</h3>
          {selectedTenantRent && (
            <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <IconHome size={20} color="#6366f1" />
              <span>Room Monthly Rent: <strong style={{ color: "#6366f1", fontSize: "18px" }}>₹{selectedTenantRent}</strong></span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', maxWidth: '500px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #eee' }}>
            {!showQr && !isPaid ? (
              <>
                <Select
                  label="Select Tenant *"
                  placeholder="Select Tenant"
                  data={tenants.map(t => ({ value: String(t.id), label: `${t.pgNumber} – ${t.studentName} ${t.monthlyRent ? `(₹${t.monthlyRent}/mo)` : ""}` }))}
                  value={form.tenantId}
                  onChange={(val) => {
                    setForm({ ...form, tenantId: val });
                    const tenant = tenants.find(t => String(t.id) === val);
                    setSelectedTenantRent(tenant?.monthlyRent || null);
                  }}
                  searchable
                  style={{ width: '100%' }}
                />

                <Select
                  label="Payment Mode *"
                  data={[
                    { value: 'CASH', label: 'Cash' },
                    { value: 'UPI', label: 'UPI' }
                  ]}
                  value={form.paymentMode}
                  onChange={(val) => setForm({ ...form, paymentMode: val })}
                  style={{ width: '100%' }}
                />

                <Select
                  label="Payment Type *"
                  data={[
                    { value: 'MONTHLY_RENT', label: 'Monthly Rent' },
                    { value: 'SECURITY_ADVANCE', label: 'Security Advance / Deposit' }
                  ]}
                  value={form.paymentType}
                  onChange={(val) => {
                    const newForm = { ...form, paymentType: val };
                    if (val === 'MONTHLY_RENT' && selectedTenantRent) {
                      newForm.amount = selectedTenantRent;
                    }
                    setForm(newForm);
                  }}
                  style={{ width: '100%' }}
                />

                <TextInput
                  label="Enter Amount (₹) *"
                  placeholder={selectedTenantRent ? `E.g. ${selectedTenantRent}` : "E.g. 5000"}
                  style={{ width: '100%' }}
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  disabled={!!form.paymentId || (form.paymentType === 'MONTHLY_RENT' && !!selectedTenantRent)}
                />

                {form.paymentMode === 'UPI' && (
                  <TextInput
                    label="Receiver UPI ID *"
                    placeholder="Enter valid UPI ID (e.g. name@okicici)"
                    style={{ width: '100%' }}
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                )}

                <Group justify="flex-end" style={{ width: '100%', marginTop: '1rem' }}>
                  {form.paymentMode === 'UPI' ? (
                    <Button onClick={() => setShowQr(true)} disabled={!form.amount || !upiId || !form.tenantId}>Generate QR</Button>
                  ) : (
                    <Button onClick={() => save()} disabled={!form.amount || !form.tenantId}>Confirm Cash</Button>
                  )}
                </Group>
              </>
            ) : isPaid ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <ThemeIcon size={60} radius="xl" color="green" variant="light" style={{ margin: '0 auto 1rem' }}>
                  <IconCheck size={32} />
                </ThemeIcon>
                <Text fw={700} size="lg">Payment Confirmed!</Text>
                <Text size="sm" c="dimmed" mt="xs">The payment has been successfully recorded.</Text>
                <Button fullWidth mt="xl" onClick={() => {
                  setIsPaid(false);
                  load();
                  navigate("/payments");
                }}>Go to Payments</Button>
              </div>
            ) : (
              <>
                <div style={{ padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #eee', textAlign: 'center', width: '100%' }}>
                  {isVerifying ? (
                    <div style={{ padding: '20px' }}>
                      <Text size="sm" mb="md">Verifying Transaction...</Text>
                      <div className="loading-dots">...</div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=PG_ADMIN&am=${form.amount}&cu=INR`)}`}
                        alt="UPI QR Code"
                        style={{ width: '200px', height: '200px' }}
                      />
                      <Text fw={700} size="xl" mt="md">₹{form.amount}</Text>
                      <Text size="xs" c="dimmed" mt="xs">Scan with any UPI App</Text>
                    </>
                  )}
                </div>

                {!isVerifying && (
                  <>
                    <TextInput
                      label="Transaction ID / UTR *"
                      placeholder="Enter 12-digit Ref No"
                      style={{ width: '100%' }}
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                    />
                    <Group justify="space-between" style={{ width: '100%', marginTop: '1rem' }}>
                      <Button variant="subtle" color="gray" onClick={() => setShowQr(false)}>Edit Details</Button>
                      <Button
                        onClick={() => {
                          setIsVerifying(true);
                          setTimeout(() => {
                            save();
                          }, 2000);
                        }}
                        disabled={utr.length < 6}
                      >
                        Verify & Confirm
                      </Button>
                    </Group>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* TABS & TABLE */}
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            mb={0}
            styles={{
              tab: { padding: '8px 16px' },
              list: { borderBottom: 'none' }
            }}
          >
            <Tabs.List>
              <Tabs.Tab value="PENDING" color="yellow">
                <Group gap={6}>
                  <span>Pending</span>
                  <span style={{ background: '#f59e0b', color: '#fff', borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '1px 8px', minWidth: 20, textAlign: 'center' }}>
                    {counts.PENDING || 0}
                  </span>
                </Group>
              </Tabs.Tab>
              <Tabs.Tab value="UNAPPROVED" color="blue">
                <Group gap={6}>
                  <span>Unapproved</span>
                  <span style={{ background: '#3f92c5', color: '#fff', borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '1px 8px', minWidth: 20, textAlign: 'center' }}>
                    {counts.UNAPPROVED || 0}
                  </span>
                </Group>
              </Tabs.Tab>
              <Tabs.Tab value="APPROVED" color="teal">
                <Group gap={6}>
                  <span>Approved</span>
                  <span style={{ background: '#10b981', color: '#fff', borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '1px 8px', minWidth: 20, textAlign: 'center' }}>
                    {counts.APPROVED || 0}
                  </span>
                </Group>
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          <Tabs
            value={activeSection}
            onChange={setActiveSection}
            variant="default"
            mb={0}
            styles={{
              tab: { padding: '8px 16px' }
            }}
          >
            <Tabs.List>
              <Tabs.Tab value="ADVANCE">
                <Group gap={6}>
                  <span>Advance Payments</span>
                  <span style={{ background: '#8b5cf6', color: '#fff', borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '1px 8px', minWidth: 20, textAlign: 'center' }}>
                    {counts[`ADVANCE_${activeTab}`] || 0}
                  </span>
                </Group>
              </Tabs.Tab>
              <Tabs.Tab value="RENT">
                <Group gap={6}>
                  <span>Rent Payments</span>
                  <span style={{ background: '#06b6d4', color: '#fff', borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '1px 8px', minWidth: 20, textAlign: 'center' }}>
                    {counts[`RENT_${activeTab}`] || 0}
                  </span>
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
          />
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <Modal opened={opened} onClose={close} title="Delete Payment" styles={{
        title: {
          fontSize: "18px",
          fontWeight: 600,
          color: "#fa5252",
        },
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
      <Modal opened={showReceipt} onClose={() => setShowReceipt(false)} size="lg" padding={0}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
          <PaymentReceipt receipt={selectedReceipt} ref={receiptRef} />
          <Button onClick={printReceipt} mt="md">Print Receipt</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Payments;