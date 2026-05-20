import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleGrid, Paper, Text, Group, ThemeIcon, Skeleton, Progress, Badge, Stack, Divider, Box, Select } from '@mantine/core';
import { IconUsers, IconCurrencyRupee, IconBed, IconTrendingUp, IconUserPlus, IconUserMinus, IconAlertCircle, IconSpeakerphone } from '@tabler/icons-react';
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
      radius="32px"
      className="premium-card"
      onClick={() => path && navigate(path)}
    >
      <Group justify="space-between">
        <Text size="xs" c="dimmed" fw={800} tt="uppercase" style={{ letterSpacing: '0.1em' }}>{title}</Text>
        <ThemeIcon color={color} variant="light" size={42} radius="14px">
          <Icon size={24} stroke={1.5} />
        </ThemeIcon>
      </Group>

      <Stack gap="xs" mt={25}>
        <Text size="xl" fw={900} style={{
          fontSize: '2rem',
          lineHeight: 1,
          fontFamily: 'Outfit, sans-serif',
          color: 'var(--primary)'
        }}>{value}</Text>
        {subValue && <Text size="sm" c="dimmed" fw={500}>{subValue}</Text>}
      </Stack>
    </Paper>
  );

  return (
    <>
      <div className="page-header">

        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconSpeakerphone size={28} color="var(--gold)" />
          Business Intelligence
        </h2>
        {!isStaff && (
          <Group gap="sm">
             <div className="slide-right first-select">
            <Select
              placeholder="All Locations"
              data={locations.map(l => ({ value: l.locationId, label: l.locationName }))}
              value={filterLoc}
              onChange={val => { setFilterLoc(val); setFilterBld(null); }}
              clearable
              radius="md"
              size="sm"
              variant="filled"
            />
            </div>
             <div className="slide-right second-select">
            <Select
              placeholder="All Buildings"
              data={buildings.filter(b => !filterLoc || b.locationId === filterLoc).map(b => ({ value: b.buildingId, label: b.buildingName }))}
              value={filterBld}
              onChange={setFilterBld}
              clearable
              radius="md"
              disabled={!filterLoc}
              size="sm"
              variant="filled"
            />
            </div>
          </Group>
        )}
      </div>

      {loading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} height={180} radius="32px" />)}
        </SimpleGrid>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" mb="xl">
            {/* OCCUPANCY CARD */}
            <StatCard
              title="Global Occupancy"
              value={`${Math.round(stats.occupancyPercentage || 0)}%`}
              subValue={`${stats.totalBeds - stats.availableBeds} / ${stats.totalBeds} Beds Filled`}
              icon={IconBed}
              color="brand"
              path="/beds"
            />

            {/* DETAILED REVENUE CARD */}
            <Paper p="xl" radius="32px" className="premium-card">
              <Group justify="space-between" mb="md">
                <Text size="xs" c="dimmed" fw={800} tt="uppercase" style={{ letterSpacing: '0.1em' }}>Revenue Performance</Text>
                <ThemeIcon color="green" variant="light" size={42} radius="14px">
                  <IconCurrencyRupee size={24} stroke={1.5} />
                </ThemeIcon>
              </Group>

              <Stack gap={6} mt="md">
                <Group justify="space-between">
                  <Text size="sm" fw={600}>Advance Collected</Text>
                  <Text size="sm" fw={800} c="green.8">₹{stats.advancePaidThisMonth?.toLocaleString() || 0}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" fw={600}>Rent Collected</Text>
                  <Text size="sm" fw={800} c="green.8">₹{stats.rentPaidThisMonth?.toLocaleString() || 0}</Text>
                </Group>
                <Divider my="sm" style={{ opacity: 0.5 }} />
                <Group justify="space-between">
                  <Text size="sm" fw={600} c="brand.8">Advance Outstanding</Text>
                  <Text size="sm" fw={800} c="brand.8">₹{stats.advanceBalance?.toLocaleString() || 0}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" fw={600} c="red.8">Rent Outstanding</Text>
                  <Text size="sm" fw={800} c="red.8">₹{stats.rentBalance?.toLocaleString() || 0}</Text>
                </Group>
              </Stack>
            </Paper>

            {/* STAFF CARD */}
            <StatCard
              title="Active Workforce"
              value={stats.totalStaff || 0}
              subValue="Staff currently on duty"
              icon={IconUsers}
              color="violet"
              path="/staff"
            />

            {/* RESIDENT OVERVIEW CARD */}
            <Paper
              p="xl"
              radius="32px"
              className="premium-card"
              onClick={() => navigate('/tenants')}
            >
              <Group justify="space-between" mb="md">
                <Text size="xs" c="dimmed" fw={800} tt="uppercase" style={{ letterSpacing: '0.1em' }}>Resident Intelligence</Text>
                <ThemeIcon color="brand" variant="light" size={42} radius="14px">
                  <IconUsers size={24} stroke={1.5} />
                </ThemeIcon>
              </Group>

              <Stack gap={6} mt="md">
                <Group justify="space-between">
                  <Text size="sm" fw={600}>Onboarded Residents</Text>
                  <Text size="sm" fw={800}>{stats.activeResidents || 0}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" fw={600}>Recently Vacated</Text>
                  <Text size="sm" fw={800}>{stats.vacatedTenantsThisMonth || 0}</Text>
                </Group>
                <Divider my="sm" style={{ opacity: 0.5 }} />
                <Group justify="space-between">
                  <Text size="sm" fw={600} c="red.8">Payment Defaulters</Text>
                  <Text size="sm" fw={800} c="red.8">{stats.advanceNotPaidResidents || 0}</Text>
                </Group>
              </Stack>
            </Paper>

            {/* EXPENSE CARD */}
            <StatCard
              title="Operational Burn"
              value={`₹${stats.totalExpenses?.toLocaleString() || 0}`}
              subValue="Total Maintenance Costs"
              icon={IconAlertCircle}
              color="red"
              path="/expenses"
            />

            {/* PROFIT CARD */}
            <StatCard
              title="Net Profitability"
              value={`₹${stats.totalProfit?.toLocaleString() || 0}`}
              subValue="Bottom line performance"
              icon={IconTrendingUp}
              color={stats.totalProfit >= 0 ? "teal" : "red"}
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Paper p="xl" radius="32px" className="premium-card">
              <Group justify="space-between" mb="xl">
                <Text fw={800} style={{ fontFamily: 'Outfit, sans-serif' }}>Revenue Trajectory</Text>
                <IconTrendingUp size={24} color="var(--accent-gold)" />
              </Group>
              <Group align="flex-end" justify="space-around" h={240} gap="xs">
                {Object.entries(stats.monthlyRevenue || {}).map(([month, rev]) => (
                  <Stack key={month} align="center" gap={8} style={{ flex: 1 }}>
                    <Box
                      bg="linear-gradient(to top, var(--primary), var(--accent-gold))"
                      w="100%"
                      style={{
                        height: `${Math.max((rev / (Math.max(...Object.values(stats.monthlyRevenue)) || 1)) * 180, 5)}px`,
                        borderRadius: '12px 12px 4px 4px',
                        transition: 'height 1s cubic-bezier(0.23, 1, 0.32, 1)',
                        opacity: 0.9
                      }}
                    />
                    <Text size="xs" fw={700} tt="uppercase">{month.substring(0, 3)}</Text>
                  </Stack>
                ))}
              </Group>
            </Paper>

            <Paper p="xl" radius="32px" className="premium-card">
              <Text fw={800} mb="xl" style={{ fontFamily: 'Outfit, sans-serif' }}>Live Operations Monitor</Text>
              <Stack gap="xl">
                <div>
                  <Group justify="space-between" mb={8}>
                    <Text size="sm" fw={600}>Inventory Occupancy</Text>
                    <Text size="sm" fw={900} c="brand.8">{Math.round(stats.occupancyPercentage || 0)}%</Text>
                  </Group>
                  <Progress value={stats.occupancyPercentage} color="brand" size="xl" radius="xl" style={{ height: '12px' }} />
                </div>

                <Divider style={{ opacity: 0.3 }} />

                <SimpleGrid cols={2}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" style={{ letterSpacing: '0.05em' }}>Finalized Payments</Text>
                    <Text fw={900} size="xl">{stats.paymentsDone || 0}</Text>
                  </Stack>
                  <Stack gap={4} align="flex-end">
                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" style={{ letterSpacing: '0.05em' }}>Awaiting Approval</Text>
                    <Text fw={900} size="xl" c="brand.7">{stats.paymentsUnapproved || 0}</Text>
                  </Stack>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" style={{ letterSpacing: '0.05em' }}>Inventory Vacancy</Text>
                    <Text fw={900} size="xl" c="green.7">{stats.availableBeds || 0}</Text>
                  </Stack>
                  <Stack gap={4} align="flex-end">
                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" style={{ letterSpacing: '0.05em' }}>System Alerts</Text>
                    <Text fw={900} size="xl" c="red.7">{stats.openComplaints || 0}</Text>
                  </Stack>
                </SimpleGrid>
              </Stack>
            </Paper>
          </SimpleGrid>
        </>
      )}
    </>
  );
};

export default Dashboard;
