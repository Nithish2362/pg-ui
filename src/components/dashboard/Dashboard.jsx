import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleGrid, Paper, Text, Group, ThemeIcon, Skeleton } from '@mantine/core';
import { IconUsers, IconCurrencyRupee, IconBed, IconAlertCircle, IconHistory } from '@tabler/icons-react';
import api from '../../api/Interceptor';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => { 
    api.get('/dashboard')
       .then(r => setStats(r.data.response || r.data.data || r.data))
       .catch(err => console.error(err))
       .finally(() => setLoading(false));
  }, []);

  const data = [
    { title: 'Total / Active Tenants', icon: IconUsers, color: 'blue', value: `${stats.totalTenants || 0} / ${stats.activeTenants || 0}`, path: '/tenants' },
    { title: 'Total Revenue', icon: IconCurrencyRupee, color: 'teal', value: `₹${stats.totalRevenue || 0}`, path: '/payments' },
    { title: 'Available Beds', icon: IconBed, color: 'cyan', value: stats.availableBeds || 0, path: '/beds' },
    { title: 'Open Complaints', icon: IconAlertCircle, color: 'red', value: stats.openComplaints || 0, path: '/complaints' },
    { title: 'Today Activity', icon: IconHistory, color: 'grape', value: `${stats.todayCheckIns || 0} In/Outs`, path: '/logs' },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>📊 DASHBOARD</h2>
      </div>
      
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
        {loading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} height={120} radius="md" />)
        ) : (
          data.map((stat) => (
            <Paper 
              key={stat.title} 
              p="xl" 
              radius="md" 
              withBorder 
              onClick={() => navigate(stat.path)}
              style={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  {stat.title}
                </Text>
                <ThemeIcon color={stat.color} variant="light" size={38} radius="md">
                  <stat.icon size={24} stroke={1.5} />
                </ThemeIcon>
              </Group>

              <Group align="flex-end" gap="xs" mt={25}>
                <Text size="xl" fw={800} style={{ fontSize: '1.8rem', lineHeight: 1 }}>
                  {stat.value}
                </Text>
              </Group>
            </Paper>
          ))
        )}
      </SimpleGrid>
    </div>
  );
};

export default Dashboard;
