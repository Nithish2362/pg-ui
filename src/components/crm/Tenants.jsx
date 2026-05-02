import React, { useState, useEffect } from 'react';
import { Button, TextInput, Select, Text, Group, Badge, Modal, Grid, Textarea, NumberInput, ActionIcon, Tooltip, LoadingOverlay, Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconEdit, IconTrash, IconReceipt, IconCheck, IconX, IconUserPlus, IconSearch, IconFilter } from '@tabler/icons-react';
import api from '../../api/Interceptor';
import notify from '../utils/Notification';
import useDebounce from '../../common/useDebounce';
import DataTable from '../common/DataTable';

const Tenants = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isStaff = user.role === 'STAFF';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const debouncedSearch = useDebounce(search, 500);

  // Filter State (Admin Only)
  const [filterLoc, setFilterLoc] = useState(null);
  const [filterBld, setFilterBld] = useState(null);

  // Master Data for Cascading Selection
  const [locations, setLocations] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);

  const [opened, { open, close }] = useDisclosure(false);
  const [checkoutOpened, setCheckoutOpened] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    studentName: '',
    mobileNumber: '',
    email: '',
    address: '',
    parentName: '',
    parentMobileNumber: '',
    advancePayment: 0,
    rentStartDate: new Date().toISOString().split('T')[0],
    paymentMode: 'CASH',
    locationId: '',
    buildingId: '',
    floorId: '',
    roomId: '',
    bedId: ''
  });

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

  // Cascade: Location -> Building
  useEffect(() => {
    if (form.locationId) {
      // Already loaded all buildings, just filter in UI if needed or fetch if API supports it
    }
  }, [form.locationId]);

  // Cascade: Building -> Floor
  useEffect(() => {
    const fetchFloors = async () => {
      if (!form.buildingId) { setFloors([]); return; }
      try {
        const res = await api.get(`/admin/floors?buildingId=${form.buildingId}`);
        setFloors(res.data?.response || []);
      } catch (err) { setFloors([]); }
    };
    fetchFloors();
  }, [form.buildingId]);

  // Cascade: Floor -> Room
  useEffect(() => {
    const fetchRooms = async () => {
      if (!form.floorId) { setRooms([]); return; }
      try {
        const res = await api.get(`/admin/rooms?floorId=${form.floorId}`);
        setRooms(res.data?.response || []);
      } catch (err) { setRooms([]); }
    };
    fetchRooms();
  }, [form.floorId]);

  // Cascade: Room -> Bed
  useEffect(() => {
    const fetchBeds = async () => {
      if (!form.roomId) { setBeds([]); return; }
      try {
        const res = await api.get(`/admin/beds?roomId=${form.roomId}`);
        setBeds(res.data?.response || []);
      } catch (err) { setBeds([]); }
    };
    fetchBeds();
  }, [form.roomId]);

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

  useEffect(() => { load(); }, [page, debouncedSearch, pageSize, activeTab, filterLoc, filterBld]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        paymentAmount: form.advancePayment // mapping for backend
      };
      if (editingId) {
        // Update logic...
      } else {
        await api.post(`/admin/tenants?bedId=${form.bedId}`, payload);
        notify({ title: "Success", message: "Tenant registered successfully!", success: true });
      }
      close();
      resetForm();
      load();
    } catch (error) {
      notify({ title: "Error", message: error.response?.data?.message || "Operation failed", error: true });
    }
  };

  const resetForm = () => {
    setForm({
      studentName: '', mobileNumber: '', email: '', address: '',
      parentName: '', parentMobileNumber: '', advancePayment: 0,
      rentStartDate: new Date().toISOString().split('T')[0],
      paymentMode: 'CASH', locationId: '', buildingId: '',
      floorId: '', roomId: '', bedId: ''
    });
    setEditingId(null);
  };

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
      header: "Status", key: "status", render: (val) => (
        <Badge color={val === 'ACTIVE' ? 'green' : (val === 'NOT_APPROVED' ? 'yellow' : 'gray')}>
          {val}
        </Badge>
      )
    },
    {
      header: "Actions", key: "actions", render: (_, t) => (
        <Group gap="xs">
          {t.status === 'ACTIVE' && (
            <Tooltip label="Checkout">
              <ActionIcon color="red" variant="light" onClick={() => { setSelectedTenant(t); setCheckoutOpened(true); }}>
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      )
    }
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'md' }}>
        <Group align="center" gap="xl">
          <h2>Resident Management</h2>
          {!isStaff && (
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
        <Button leftSection={<IconUserPlus size={18} />} onClick={() => { resetForm(); open(); }} size="sm">Register Tenant</Button>
      </div>

      <Group mb="md">
        <Button variant={activeTab === 'ACTIVE' ? 'filled' : 'outline'} onClick={() => setActiveTab('ACTIVE')} size="sm">Active</Button>
        <Button variant={activeTab === 'NOT_APPROVED' ? 'filled' : 'outline'} onClick={() => setActiveTab('NOT_APPROVED')} size="sm">Pending Approval</Button>
        <Button variant={activeTab === 'INACTIVE' ? 'filled' : 'outline'} onClick={() => setActiveTab('INACTIVE')} size="sm">History</Button>
      </Group>


      <DataTable
        title="Resident List"
        columns={columns}
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

      <Modal opened={opened} onClose={close} title="New Tenant Registration" size="xl" centered>
        <form onSubmit={handleSave}>
          <Grid>
            <Grid.Col span={6}><TextInput label="Full Name" placeholder="Student Name" value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} required /></Grid.Col>
            <Grid.Col span={6}><TextInput label="Mobile Number" placeholder="10 digit mobile" value={form.mobileNumber} onChange={e => setForm({ ...form, mobileNumber: e.target.value })} required /></Grid.Col>
            <Grid.Col span={6}><TextInput label="Email Address" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></Grid.Col>
            <Grid.Col span={6}><TextInput label="Parent Name" value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} /></Grid.Col>

            <Grid.Col span={12}><Paper p="md" withBorder bg="gray.0"><Text fw={700} mb="xs">Room Assignment (Cascading Selection)</Text>
              <Grid>
                <Grid.Col span={4}>
                  <Select label="Location" data={locations.map(l => ({ value: l.locationId, label: l.locationName }))} value={form.locationId} onChange={val => setForm({ ...form, locationId: val, buildingId: '', floorId: '', roomId: '', bedId: '' })} required searchable />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Select label="Building" data={buildings.filter(b => b.locationId === form.locationId).map(b => ({ value: b.buildingId, label: b.buildingName }))} value={form.buildingId} onChange={val => setForm({ ...form, buildingId: val, floorId: '', roomId: '', bedId: '' })} required searchable disabled={!form.locationId} />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Select label="Floor" data={floors.map(f => ({ value: f.floorId, label: f.floorName }))} value={form.floorId} onChange={val => setForm({ ...form, floorId: val, roomId: '', bedId: '' })} required searchable disabled={!form.buildingId} />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select label="Room" data={rooms.map(r => ({ value: r.roomId, label: `Room ${r.roomNumber} (${r.roomType})` }))} value={form.roomId} onChange={val => setForm({ ...form, roomId: val, bedId: '' })} required searchable disabled={!form.floorId} />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select label="Bed" data={beds.filter(b => !b.isOccupied).map(b => ({ value: b.bedId, label: `Bed ${b.bedNumber}` }))} value={form.bedId} onChange={val => setForm({ ...form, bedId: val })} required searchable disabled={!form.roomId} />
                </Grid.Col>
              </Grid>
            </Paper></Grid.Col>

            <Grid.Col span={4}><NumberInput label="Advance Payment (₹)" value={form.advancePayment} onChange={val => setForm({ ...form, advancePayment: val })} required min={0} /></Grid.Col>
            <Grid.Col span={4}><Select label="Payment Mode" data={['CASH', 'ONLINE', 'UPI']} value={form.paymentMode} onChange={val => setForm({ ...form, paymentMode: val })} /></Grid.Col>
            <Grid.Col span={4}><TextInput label="Rent Start Date" type="date" value={form.rentStartDate} onChange={e => setForm({ ...form, rentStartDate: e.target.value })} /></Grid.Col>
          </Grid>
          <Group justify="flex-end" mt="xl">
            <Button variant="outline" color="gray" onClick={close}>Cancel</Button>
            <Button type="submit">Complete Registration</Button>
          </Group>
        </form>
      </Modal>

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
