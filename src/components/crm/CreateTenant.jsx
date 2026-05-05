import React, { useState, useEffect } from 'react';
import { Button, TextInput, Select, Text, Group, Grid, NumberInput, Paper, Card, ActionIcon, Title, Breadcrumbs, Anchor, Divider } from '@mantine/core';
import { IconArrowLeft, IconUserPlus, IconHome, IconBed } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/Interceptor';
import notify from '../utils/Notification';

const CreateTenant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Master Data
  const [locations, setLocations] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStaff = user?.role === 'STAFF';

  const [form, setForm] = useState({
    studentName: '',
    mobileNumber: '',
    email: '',
    address: '',
    fatherName: '',
    fatherMobile: '',
    motherName: '',
    motherMobile: '',
    guardianName: '',
    guardianMobile: '',
    advancePayment: 0,
    rentStartDate: new Date().toISOString().split('T')[0],
    paymentMode: 'CASH',
    locationId: isStaff ? user.locationId : '',
    buildingId: isStaff ? user.buildingId : '',
    floorId: '',
    roomId: '',
    bedId: ''
  });

  useEffect(() => {
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
    loadMasters();
  }, []);

  // Cascade Logic
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

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validation: At least one parent/guardian info is mandatory
    const hasFather = form.fatherName && form.fatherMobile;
    const hasMother = form.motherName && form.motherMobile;
    const hasGuardian = form.guardianName && form.guardianMobile;

    if (!hasFather && !hasMother && !hasGuardian) {
      notify({ 
        title: "Validation Error", 
        message: "At least one parent or guardian's details (Name and Mobile) are mandatory.", 
        error: true 
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        paymentAmount: form.advancePayment,
        rentStartDate: form.rentStartDate ? `${form.rentStartDate}T00:00:00` : null
      };
      await api.post(`/admin/tenants?bedId=${form.bedId}`, payload);
      notify({ title: "Success", message: "Tenant registered successfully!", success: true });
      navigate('/tenants');
    } catch (error) {
      notify({ title: "Error", message: error.response?.data?.message || "Operation failed", error: true });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Residents', href: '/tenants' },
    { title: 'New Registration', href: '#' },
  ].map((item, index) => (
    <Anchor href={item.href} key={index} size="sm" color="dimmed">
      {item.title}
    </Anchor>
  ));

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Group justify="space-between" mb="lg">
        <div>
          <Breadcrumbs mb="xs">{breadcrumbs}</Breadcrumbs>
          <Group>
            <ActionIcon variant="light" onClick={() => navigate('/tenants')} size="lg">
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>New Tenant Registration</Title>
          </Group>
        </div>
        <Button 
          variant="outline" 
          color="gray" 
          onClick={() => navigate('/tenants')}
          leftSection={<IconArrowLeft size={18} />}
        >
          Back to List
        </Button>
      </Group>

      <form onSubmit={handleSave}>
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card withBorder padding="xl" radius="md" shadow="sm">
              <Group mb="xl">
                <IconUserPlus size={24} color="var(--mantine-color-blue-6)" />
                <Title order={4}>Resident Details</Title>
              </Group>

              <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput label="Full Name" placeholder="Student Name" value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} required size="md" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput label="Mobile Number" placeholder="10 digit mobile" value={form.mobileNumber} onChange={e => setForm({ ...form, mobileNumber: e.target.value })} required size="md" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput label="Email Address" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required size="md" />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput label="Permanent Address" placeholder="Enter full address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} size="md" />
                </Grid.Col>
              </Grid>

              <Divider my="xl" label="Parent / Guardian Information" labelPosition="center" />

              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper p="md" withBorder bg="gray.0" radius="md">
                    <Text fw={700} mb="sm" size="sm">Father's Details</Text>
                    <Grid>
                      <Grid.Col span={12}><TextInput label="Name" placeholder="Father's Name" value={form.fatherName} onChange={e => setForm({ ...form, fatherName: e.target.value })} /></Grid.Col>
                      <Grid.Col span={12}><TextInput label="Mobile" placeholder="Father's Mobile" value={form.fatherMobile} onChange={e => setForm({ ...form, fatherMobile: e.target.value })} /></Grid.Col>
                    </Grid>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper p="md" withBorder bg="gray.0" radius="md">
                    <Text fw={700} mb="sm" size="sm">Mother's Details</Text>
                    <Grid>
                      <Grid.Col span={12}><TextInput label="Name" placeholder="Mother's Name" value={form.motherName} onChange={e => setForm({ ...form, motherName: e.target.value })} /></Grid.Col>
                      <Grid.Col span={12}><TextInput label="Mobile" placeholder="Mother's Mobile" value={form.motherMobile} onChange={e => setForm({ ...form, motherMobile: e.target.value })} /></Grid.Col>
                    </Grid>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Paper p="md" withBorder bg="gray.0" radius="md">
                    <Text fw={700} mb="sm" size="sm">Guardian's Details (Optional if parents provided)</Text>
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Guardian Name" placeholder="Guardian's Name" value={form.guardianName} onChange={e => setForm({ ...form, guardianName: e.target.value })} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Guardian Mobile" placeholder="Guardian's Mobile" value={form.guardianMobile} onChange={e => setForm({ ...form, guardianMobile: e.target.value })} /></Grid.Col>
                    </Grid>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <div style={{ position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Card withBorder padding="xl" radius="md" shadow="sm">
                <Group mb="xl">
                  <IconHome size={24} color="var(--mantine-color-blue-6)" />
                  <Title order={4}>Room Assignment</Title>
                </Group>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {!isStaff && (
                    <>
                      <Select label="Location" data={locations.map(l => ({ value: l.locationId, label: l.locationName }))} value={form.locationId} onChange={val => setForm({ ...form, locationId: val, buildingId: '', floorId: '', roomId: '', bedId: '' })} required searchable />
                      <Select label="Building" data={buildings.filter(b => b.locationId === form.locationId).map(b => ({ value: b.buildingId, label: b.buildingName }))} value={form.buildingId} onChange={val => setForm({ ...form, buildingId: val, floorId: '', roomId: '', bedId: '' })} required searchable disabled={!form.locationId} />
                    </>
                  )}
                  <Select label="Floor" data={floors.map(f => ({ value: f.floorId, label: f.floorName }))} value={form.floorId} onChange={val => setForm({ ...form, floorId: val, roomId: '', bedId: '' })} required searchable disabled={!form.buildingId} />
                  <Select label="Room" data={rooms.map(r => ({ value: r.roomId, label: `Room ${r.roomNumber} (${r.roomType})` }))} value={form.roomId} onChange={val => setForm({ ...form, roomId: val, bedId: '' })} required searchable disabled={!form.floorId} />
                  <Select label="Bed" data={beds.filter(b => !b.isOccupied).map(b => ({ value: b.bedId, label: `Bed ${b.bedNumber}` }))} value={form.bedId} onChange={val => setForm({ ...form, bedId: val })} required searchable disabled={!form.roomId} />
                </div>
              </Card>

              <Card withBorder padding="xl" radius="md" shadow="sm">
                <Group mb="xl">
                  <IconBed size={24} color="var(--mantine-color-blue-6)" />
                  <Title order={4}>Payment Details</Title>
                </Group>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <NumberInput label="Advance Payment (₹)" value={form.advancePayment} onChange={val => setForm({ ...form, advancePayment: val })} required min={0} size="md" />
                  <TextInput label="Rent Start Date" type="date" value={form.rentStartDate} onChange={e => setForm({ ...form, rentStartDate: e.target.value })} size="md" />
                </div>

                <Button type="submit" fullWidth size="lg" mt="xl" loading={loading} leftSection={<IconUserPlus size={20} />}>
                  Complete Registration
                </Button>
              </Card>
            </div>
          </Grid.Col>
        </Grid>
      </form>
    </div>
  );
};

export default CreateTenant;
