import React, { useState, useEffect } from 'react';
import { Button, TextInput, Select, Text, Group, Badge, Modal, ActionIcon, Tooltip, Tabs } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconX, IconUserPlus, IconCurrencyRupee, IconLogout, IconUsers } from '@tabler/icons-react';
import api from '../../api/Interceptor';
import notify from '../utils/Notification';
import useDebounce from '../../common/useDebounce';
import DataTable from '../common/DataTable';

const Tenants = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isStaff = user.role === 'STAFF';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [counts, setCounts] = useState({ active: 0, awaiting: 0, history: 0 });
  const debouncedSearch = useDebounce(search, 500);

  // Filter State (Admin Only)
  const [filterLoc, setFilterLoc] = useState(null);
  const [filterBld, setFilterBld] = useState(null);

  // Master Data
  const [locations, setLocations] = useState([]);
  const [buildings, setBuildings] = useState([]);

  const [checkoutOpened, setCheckoutOpened] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  const loadMasters = async () => {
    try {
      const [locRes, bldRes] = await Promise.all([
        api.get("/admin/locations/get-all"),
        api.get("/admin/buildings")
      ]);
      setLocations(locRes.data?.response || []);
      setBuildings(bldRes.data?.response || []);
    } catch (err) { console.error("Error loading masters", err); }
  };

  useEffect(() => { loadMasters(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      let url = `/admin/tenants/view?page=${page - 1}&pageSize=${pageSize}&status=${activeTab}&searchTerm=${debouncedSearch}`;
      if (filterLoc) url += `&locationId=${filterLoc}`;
      if (filterBld) url += `&buildingId=${filterBld}`;

      const res = await api.get(url);
      setItems(res.data?.response || []);
      setTotalCount(res.data?.count || 0);
    } catch (err) {
      notify({ title: "Error", message: "Failed to load tenants", error: true });
    } finally {
      setLoading(false);
    }
  };

  const loadCounts = async () => {
    try {
      const res = await api.get("/admin/tenants/counts");
      setCounts(res.data?.response || { active: 0, awaiting: 0, history: 0 });
    } catch (err) { console.error("Error loading counts", err); }
  };

  useEffect(() => { load(); loadCounts(); }, [page, debouncedSearch, pageSize, activeTab, filterLoc, filterBld]);

  const handleCheckout = async () => {
    try {
      await api.put(`/admin/tenants/${selectedTenant.pgNumber}/checkout`);
      notify({ title: "Checked Out", message: "Tenant has been checked out and bed released.", success: true });
      setCheckoutOpened(false);
      load();
    } catch (error) {
      notify({ message: "Checkout failed", error: true });
    }
  };

  const columns = [
    { header: "PG ID", key: "pgNumber", render: (val) => <Text fw={700}>{val}</Text> },
    { header: "Tenant Name", key: "studentName" },
    { header: "Building", key: "buildingName" },
    { header: "Room/Bed", key: "roomName", render: (val, t) => `${val} - ${t.bedNumber}` },
    { header: "Mobile", key: "mobileNumber" },
    {
      header: "Amount", key: "amount", render: (_, t) => (
        <Text fw={900} size="sm" >₹ {t.balanceAmount || 0}</Text>
      )
    },
    {
      header: "Payment Action", key: "paymentAction", render: (_, t) => {
        const balance = t.balanceAmount || 0;

        if (t.hasUnapprovedPayment) {
          return (
            <Button
              size="compact-xs"
              color="indigo"
              variant="filled"
              onClick={() => navigate(`/payments?tab=unapproved&search=${t.studentName}`)}
            >
              Verify Payment
            </Button>
          );
        }

        if (t.status === 'NOT_APPROVED') {
          return (
            <Button
              size="compact-xs"
              color="yellow"
              variant="light"
              onClick={() => navigate(`/payments?tab=pending&section=advance&search=${t.studentName}`)}
            >
              Pay Now
            </Button>
          );
        }
        if (t.status === 'ACTIVE') {
          if (balance > 0) {
            return (
              <Button
                size="compact-xs"
                color="red"
                variant="light"
                onClick={() => navigate(`/payments?tab=pending&section=rent&search=${t.studentName}`)}
              >
                Pay Now
              </Button>
            );
          } else {
            return <Badge color="brand" variant="filled">PAID</Badge>;
          }
        }
        return <Text c="dimmed" size="xs">-</Text>;
      }
    },
    {
      header: "Manage", key: "actions", render: (_, t) => (
        <Group gap="xs" justify="center">
          {t.status === 'ACTIVE' && (
            <Tooltip label="Checkout Resident">
              <ActionIcon color="red" variant="subtle" onClick={() => {
                if (t.balanceAmount > 0) {
                  notify({ title: "Checkout Blocked", message: `Please clear pending amount of ₹${t.balanceAmount} before checkout.`, error: true });
                } else {
                  setSelectedTenant(t);
                  setCheckoutOpened(true);
                }
              }}>
                <IconLogout size={18} />
              </ActionIcon>
            </Tooltip>
          )}
          {t.status === 'INACTIVE' && <Text c="dimmed" size="xs">-</Text>}
        </Group>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <Group align="center" gap="xl">
          <Group gap="sm">
            <IconUsers size={32} color="var(--gold)" />
            <h2>Resident Registry</h2>
          </Group>
          {!isStaff && (
            <Group gap="sm">
              <Select
                placeholder="Select Location"
                data={locations.map(l => ({ value: l.locationId, label: l.locationName }))}
                value={filterLoc}
                onChange={val => { setFilterLoc(val); setFilterBld(null); }}
                clearable
                size="md"
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
                variant="filled"
              />
            </Group>
          )}
        </Group>
        <Button leftSection={<IconUserPlus size={18} />} onClick={() => navigate('/tenants/create')} size="sm">Register Resident</Button>
      </div>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        mb="xl"
        styles={{
          tab: { padding: '12px 20px', fontWeight: 600 },
          list: { borderBottom: 'none' }
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="ACTIVE" color="brand">
            <Group gap={8}>
              <span>Active</span>
              <Badge variant="filled" color="brand" size="sm">{counts.active}</Badge>
            </Group>
          </Tabs.Tab>
          <Tabs.Tab value="NOT_APPROVED" color="yellow">
            <Group gap={8}>
              <span>Pending Approval</span>
              <Badge variant="filled" color="brand" size="sm">{counts.awaiting}</Badge>
            </Group>
          </Tabs.Tab>
          <Tabs.Tab value="INACTIVE" color="gray">
            <Group gap={8}>
              <span>Vacated</span>
              <Badge variant="filled" color="brand" size="sm">{counts.history}</Badge>
            </Group>
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>


      <DataTable
        title="Resident List"
        columns={activeTab === 'ACTIVE' ? columns : columns.filter(c => c.key !== 'actions')}
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

      <Modal opened={checkoutOpened} onClose={() => setCheckoutOpened(false)} title="Confirm Checkout" centered>
        <Text size="sm">Are you sure you want to checkout <b>{selectedTenant?.studentName}</b>? This will release the bed and mark them as Inactive.</Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="gray" onClick={() => setCheckoutOpened(false)}>Cancel</Button>
          <Button color="red" onClick={handleCheckout}>Confirm Checkout</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default Tenants;
