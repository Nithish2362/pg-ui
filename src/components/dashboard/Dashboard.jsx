import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleGrid, Paper, Text, Group, ThemeIcon, Skeleton, Progress, Badge, Stack, Divider, Box, Select } from '@mantine/core';
import { IconUsers, IconCurrencyRupee, IconBed, IconTrendingUp, IconUserPlus, IconUserMinus, IconAlertCircle } from '@tabler/icons-react';
import api from '../../api/Interceptor';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isStaff = user.role === 'STAFF';

  // Filters
  const [filterLoc, setFilterLoc] = useState(null);
  const [filterBld, setFilterBld] = useState(null);

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

  const loadStats = async () => {
    try {
      setLoading(true);
      let url = '/dashboard';
      const params = [];
      if (filterLoc) params.push(`locationId=${filterLoc}`);
      if (filterBld) params.push(`buildingId=${filterBld}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      setStats(res.data.response || res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMasters(); }, []);
  useEffect(() => { loadStats(); }, [filterLoc, filterBld]);

  const StatCard = ({ title, value, icon: Icon, color, path, subValue }) => (
    <Paper
      p="xl"
      radius="md"
      withBorder
      onClick={() => path && navigate(path)}
      style={{
        cursor: path ? 'pointer' : 'default',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => path && (e.currentTarget.style.transform = 'translateY(-5px)')}
      onMouseLeave={(e) => path && (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <Group justify="space-between">
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">{title}</Text>
        <ThemeIcon color={color} variant="light" size={38} radius="md">
          <Icon size={24} stroke={1.5} />
        </ThemeIcon>
      </Group>

      <Stack gap="xs" mt={25}>
        <Text size="xl" fw={800} style={{ fontSize: '1.8rem', lineHeight: 1 }}>{value}</Text>
        {subValue && <Text size="sm" c="dimmed">{subValue}</Text>}
      </Stack>
    </Paper>
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Business Overview</h2>
        {!isStaff && (
          <Group>
            <Select 
              placeholder="All Locations" 
              data={locations.map(l => ({ value: l.locationId, label: l.locationName }))} 
              value={filterLoc} 
              onChange={val => { setFilterLoc(val); setFilterBld(null); }} 
              clearable 
              size="xs"
              style={{ width: '150px' }}
            />
            <Select 
              placeholder="All Buildings" 
              data={buildings.filter(b => !filterLoc || b.locationId === filterLoc).map(b => ({ value: b.buildingId, label: b.buildingName }))} 
              value={filterBld} 
              onChange={setFilterBld} 
              clearable 
              disabled={!filterLoc}
              size="xs"
              style={{ width: '150px' }}
            />
          </Group>
        )}
      </div>

      {loading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} height={140} radius="md" />)}
        </SimpleGrid>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl" mb="xl">
            <StatCard 
              title="Occupancy" 
              value={`${Math.round(stats.occupancyPercentage || 0)}%`} 
              subValue={`${stats.totalBeds - stats.availableBeds} / ${stats.totalBeds} Beds Occupied`}
              icon={IconBed} 
              color="blue" 
              path="/beds" 
            />
            <StatCard 
              title="Revenue (This Month)" 
              value={`₹${stats.totalRevenue?.toLocaleString() || 0}`} 
              subValue={`₹${stats.pendingRevenue?.toLocaleString() || 0} Pending`}
              icon={IconCurrencyRupee} 
              color="green" 
              path="/payments" 
            />
            <StatCard 
              title="Active Residents" 
              value={stats.activeResidents || 0} 
              subValue={`${stats.newTenantsThisMonth || 0} New this month`}
              icon={IconUsers} 
              color="violet" 
              path="/tenants" 
            />
             <StatCard 
              title="Check-outs" 
              value={stats.vacatedTenantsThisMonth || 0} 
              subValue="Tenants left this month"
              icon={IconUserMinus} 
              color="orange" 
              path="/tenants" 
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Paper p="xl" radius="md" withBorder>
              <Group justify="space-between" mb="xl">
                <Text fw={700}>Monthly Revenue Trends</Text>
                <IconTrendingUp size={20} color="green" />
              </Group>
              <Group align="flex-end" justify="space-around" h={200} gap="xs">
                {Object.entries(stats.monthlyRevenue || {}).map(([month, rev]) => (
                  <Stack key={month} align="center" gap={4} style={{ flex: 1 }}>
                    <Box 
                      bg="blue.5" 
                      w="100%" 
                      style={{ 
                        height: `${Math.max((rev / (Math.max(...Object.values(stats.monthlyRevenue)) || 1)) * 150, 5)}px`,
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.5s ease'
                      }} 
                    />
                    <Text size="xs" fw={600}>{month}</Text>
                  </Stack>
                ))}
              </Group>
            </Paper>

            <Paper p="xl" radius="md" withBorder>
              <Text fw={700} mb="xl">Quick Status</Text>
              <Stack gap="md">
                <div>
                  <Group justify="space-between" mb={5}>
                    <Text size="sm">Beds Occupied</Text>
                    <Text size="sm" fw={700}>{Math.round(stats.occupancyPercentage || 0)}%</Text>
                  </Group>
                  <Progress value={stats.occupancyPercentage} color="blue" size="lg" radius="xl" />
                </div>
                
                <Divider />
                
                <Group justify="space-between">
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">PAYMENTS DONE</Text>
                    <Text fw={700}>{stats.paymentsDone || 0}</Text>
                  </Stack>
                  <Stack gap={0} align="flex-end">
                    <Text size="xs" c="dimmed">PENDING APPROVAL</Text>
                    <Text fw={700} c="orange">{stats.paymentsUnapproved || 0}</Text>
                  </Stack>
                </Group>

                <Group justify="space-between">
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">TOTAL VACANT BEDS</Text>
                    <Text fw={700} c="green">{stats.availableBeds || 0}</Text>
                  </Stack>
                  <Stack gap={0} align="flex-end">
                    <Text size="xs" c="dimmed">OPEN COMPLAINTS</Text>
                    <Text fw={700} c="red">{stats.openComplaints || 0}</Text>
                  </Stack>
                </Group>
              </Stack>
            </Paper>
          </SimpleGrid>
        </>
      )}
    </div>
  );
};

export default Dashboard;
