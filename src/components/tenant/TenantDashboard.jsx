import React, { useState, useEffect } from 'react';
import { Paper, Text, Group, Button, SimpleGrid, ThemeIcon, Skeleton, Badge, Card, Avatar } from '@mantine/core';
import { IconHome, IconCalendar, IconCreditCard, IconUser, IconMessageShare } from '@tabler/icons-react';
import api from '../../api/Interceptor';
import notify from '../utils/Notification';

const TenantDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        api.get('/tenant/dashboard')
            .then(res => setData(res.data.response))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleGoHome = async () => {
        if (!window.confirm("This will send a notification to your parents. Are you sure?")) return;
        
        setSending(true);
        try {
            await api.post('/tenant/leave-request', { reason: "Visiting home" });
            notify({
                title: 'Success',
                message: 'Notification sent to your parents successfully!',
                success: true
            });
        } catch (err) {
            notify({
                title: 'Error',
                message: 'Failed to send notification.',
                error: true
            });
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}><Skeleton height={200} mb="xl" /><SimpleGrid cols={3}><Skeleton height={150} /><Skeleton height={150} /><Skeleton height={150} /></SimpleGrid></div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <div className="page-header" style={{ marginBottom: '30px' }}>
                <h2>Welcome, {data?.studentName} 👋</h2>
                <Text color="dimmed">Portal for PG Management & Notifications</Text>
            </div>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                <Card shadow="sm" padding="xl" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text fw={700} size="lg">Parent Alerts</Text>
                        <ThemeIcon color="red" variant="light" size="xl" radius="md">
                            <IconMessageShare size={24} />
                        </ThemeIcon>
                    </Group>
                    <Text size="sm" color="dimmed" mb="xl">
                        Instantly notify your parents (Father, Mother, & Guardian) that you are going home for a holiday or leave.
                    </Text>
                    <Button 
                        fullWidth 
                        size="lg" 
                        color="red" 
                        variant="filled" 
                        leftSection={<IconHome size={20} />}
                        onClick={handleGoHome}
                        loading={sending}
                        style={{ height: '60px', fontSize: '1.1rem' }}
                    >
                        GO HOME / REQUEST LEAVE
                    </Button>
                </Card>

                <Card shadow="sm" padding="xl" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                        <Text fw={700} size="lg">My Stay Details</Text>
                        <ThemeIcon color="blue" variant="light" size="xl" radius="md">
                            <IconUser size={24} />
                        </ThemeIcon>
                    </Group>
                    <Group gap="lg">
                        <div>
                            <Text size="xs" color="dimmed" tt="uppercase" fw={700}>PG ID</Text>
                            <Text fw={500}>{data?.pgNumber}</Text>
                        </div>
                        <div>
                            <Text size="xs" color="dimmed" tt="uppercase" fw={700}>Bed ID</Text>
                            <Text fw={500}>{data?.bedId || 'Not Assigned'}</Text>
                        </div>
                        <div>
                            <Text size="xs" color="dimmed" tt="uppercase" fw={700}>Join Date</Text>
                            <Text fw={500}>{data?.joinDate}</Text>
                        </div>
                    </Group>
                </Card>
            </SimpleGrid>

            <Card shadow="sm" padding="xl" radius="md" withBorder mt="xl">
                <Group justify="space-between" mb="xl">
                    <Text fw={700} size="lg">Recent Payments</Text>
                    <Button variant="light" component="a" href="/tenant/payments">View All</Button>
                </Group>
                
                {data?.recentPayments?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {data.recentPayments.map((p, i) => (
                            <Paper key={i} p="md" withBorder radius="md">
                                <Group justify="space-between">
                                    <Group>
                                        <ThemeIcon color="teal" variant="light">
                                            <IconCreditCard size={16} />
                                        </ThemeIcon>
                                        <div>
                                            <Text fw={600}>₹{p.amount}</Text>
                                            <Text size="xs" color="dimmed">{p.paymentDate}</Text>
                                        </div>
                                    </Group>
                                    <Badge color="teal" variant="light">{p.paymentType}</Badge>
                                </Group>
                            </Paper>
                        ))}
                    </div>
                ) : (
                    <Text color="dimmed" ta="center" py="xl">No payments recorded yet.</Text>
                )}
            </Card>
        </div>
    );
};

export default TenantDashboard;
