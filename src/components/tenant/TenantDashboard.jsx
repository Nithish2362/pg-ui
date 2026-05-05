import React, { useState, useEffect } from 'react';
import { Paper, Text, Group, Button, SimpleGrid, ThemeIcon, Skeleton, Badge, Card, Modal, TextInput, FileInput } from '@mantine/core';
import { IconHome, IconCreditCard, IconUser, IconMessageShare, IconCash, IconUpload, IconDeviceMobile } from '@tabler/icons-react';
import api from '../../api/Interceptor';
import notify from '../utils/Notification';

const TenantDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [paying, setPaying] = useState(false);
    const [onlineModalOpen, setOnlineModalOpen] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [screenshotBase64, setScreenshotBase64] = useState('');

    useEffect(() => {
        api.get('/tenant/dashboard')
            .then(res => setData(res.data.response))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleFileChange = (file) => {
        if (!file) {
            setScreenshotBase64('');
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setScreenshotBase64(reader.result);
        };
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            notify({ title: 'Error', message: 'Failed to read file.', error: true });
        };
    };

    const submitOnlinePayment = async () => {
        if (!transactionId || !screenshotBase64) {
            notify({ title: 'Error', message: 'Please provide both Transaction ID and Screenshot.', error: true });
            return;
        }
        setPaying(true);
        try {
            const rentAmount = data?.monthlyRent || 0;
            await api.post('/tenant/payments', {
                amount: rentAmount,
                paymentMode: "ONLINE",
                paymentType: "MONTHLY_RENT",
                paymentMonth: new Date().toLocaleString('default', { month: 'long' }),
                paymentYear: new Date().getFullYear(),
                transactionId: transactionId,
                screenshotUrl: screenshotBase64,
                paymentDate: new Date().toISOString().split('T')[0]
            });
            notify({
                title: 'Success',
                message: 'Online payment details submitted for verification.',
                success: true
            });
            setOnlineModalOpen(false);
            setTransactionId('');
            setScreenshotBase64('');
            api.get('/tenant/dashboard').then(res => setData(res.data.response));
        } catch (err) {
            notify({ title: 'Error', message: 'Failed to submit online payment.', error: true });
        } finally {
            setPaying(false);
        }
    };

    const handlePayCash = async () => {
        setPaying(true);
        try {
            const rentAmount = data?.monthlyRent || 0;
            await api.post('/tenant/payments', {
                amount: rentAmount,
                paymentMode: "CASH",
                paymentType: "MONTHLY_RENT",
                paymentMonth: new Date().toLocaleString('default', { month: 'long' }),
                paymentYear: new Date().getFullYear(),
                paymentDate: new Date().toISOString().split('T')[0]
            });
            notify({
                title: 'Success',
                message: 'Cash payment recorded. Please pay to the warden.',
                success: true
            });
            api.get('/tenant/dashboard').then(res => setData(res.data.response));
        } catch (err) {
            notify({ title: 'Error', message: 'Failed to record cash payment.', error: true });
        } finally {
            setPaying(false);
        }
    };

    const handleGoHome = async () => {
        if (!window.confirm("This will send a notification to your parents. Are you sure?")) return;
        setSending(true);
        try {
            await api.post('/tenant/leave-request', { reason: "Visiting home" });
            notify({ title: 'Success', message: 'Notification sent!', success: true });
        } catch (err) {
            notify({ title: 'Error', message: 'Failed to send notification.', error: true });
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}><Skeleton height={200} mb="xl" /><SimpleGrid cols={2}><Skeleton height={150} /><Skeleton height={150} /></SimpleGrid></div>;

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
                        Instantly notify your parents (Father, Mother, & Guardian) that you are going home.
                    </Text>
                    <Button
                        fullWidth size="lg" color="red" variant="filled"
                        leftSection={<IconHome size={20} />}
                        onClick={handleGoHome} loading={sending}
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
                <Group justify="space-between" mb="xs">
                    <Text fw={700} size="lg">Rent Payment</Text>
                    <ThemeIcon color="teal" variant="light" size="xl" radius="md">
                        <IconCreditCard size={24} />
                    </ThemeIcon>
                </Group>
                <Text size="sm" color="dimmed" mb="xl">
                    Choose your preferred payment method. Cash payments require warden approval.
                </Text>
                <Group grow>
                    <Button
                        size="lg" color="orange" variant="light"
                        leftSection={<IconCash size={20} />}
                        onClick={handlePayCash} loading={paying}
                        style={{ height: '60px', fontSize: '1.1rem' }}
                    >
                        PAY BY CASH
                    </Button>
                    <Button
                        size="lg" color="teal" variant="filled"
                        leftSection={<IconUpload size={20} />}
                        onClick={() => setOnlineModalOpen(true)}
                        style={{ height: '60px', fontSize: '1.1rem' }}
                    >
                        UPLOAD ONLINE RECEIPT
                    </Button>
                </Group>
            </Card>

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
                                        <ThemeIcon color={p.paymentMode === 'CASH' ? 'orange' : 'teal'} variant="light">
                                            {p.paymentMode === 'CASH' ? <IconCash size={16} /> : <IconCreditCard size={16} />}
                                        </ThemeIcon>
                                        <div>
                                            <Text fw={600}>₹{p.amount}</Text>
                                            <Text size="xs" color="dimmed">{p.paymentDate} ({p.paymentMode})</Text>
                                        </div>
                                    </Group>
                                    <Badge color={p.status === 'APPROVED' || p.status === 'SUCCESS' ? 'green' : 'yellow'} variant="light">
                                        {p.status}
                                    </Badge>
                                </Group>
                            </Paper>
                        ))}
                    </div>
                ) : (
                    <Text color="dimmed" ta="center" py="xl">No recent payments found.</Text>
                )}
            </Card>

            <Modal opened={onlineModalOpen} onClose={() => setOnlineModalOpen(false)} title="Submit Online Payment Details" centered>
                <TextInput
                    label="UPI Transaction ID"
                    placeholder="Enter 12-digit transaction ID"
                    required
                    leftSection={<IconDeviceMobile size={16} />}
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    mb="md"
                />
                <FileInput
                    label="Upload Payment Screenshot"
                    placeholder="Select image"
                    accept="image/png,image/jpeg,image/jpg"
                    required
                    leftSection={<IconUpload size={16} />}
                    onChange={handleFileChange}
                    mb="xl"
                />
                <Button fullWidth onClick={submitOnlinePayment} loading={paying}>
                    Submit Details
                </Button>
            </Modal>
        </div>
    );
};

export default TenantDashboard;
