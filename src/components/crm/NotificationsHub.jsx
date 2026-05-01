import React, { useState, useEffect } from 'react';
import { Tabs, Paper, Text, Group, Button, TextInput, Textarea, Stack, Card, Alert, Modal, Badge, Select } from '@mantine/core';
import { IconSend, IconInfoCircle, IconUsers, IconUser } from '@tabler/icons-react';
import api from '../../api/Interceptor';
import notify from '../utils/Notification';
import DataTable from '../common/DataTable';
import useDebounce from '../../common/useDebounce';

const NotificationsHub = () => {
    const [activeTab, setActiveTab] = useState('holiday');

    // Holiday Broadcast State
    const [holidayStart, setHolidayStart] = useState('');
    const [holidayEnd, setHolidayEnd] = useState('');
    const [holidayReason, setHolidayReason] = useState('holidays');
    const [broadcastLoading, setBroadcastLoading] = useState(false);

    // Individual Notification State
    const [tenants, setTenants] = useState([]);
    const [loadingTenants, setLoadingTenants] = useState(false);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 400);

    // Modal State
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [modalOpened, setModalOpened] = useState(false);
    const [leaveReason, setLeaveReason] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sending, setSending] = useState(false);

    // Clear fields when switching tabs
    useEffect(() => {
        setHolidayStart('');
        setHolidayEnd('');
        setHolidayReason('');
        setStartDate('');
        setEndDate('');
        setLeaveReason('');
        setSearch('');
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'individual') {
            loadTenants();
        }
    }, [activeTab]);

    const loadTenants = async () => {
        try {
            setLoadingTenants(true);
            const res = await api.get('/admin/tenants');
            setTenants(res.data?.response || res.data?.data || res.data || []);
        } catch (error) {
            notify({ title: 'Error', message: 'Failed to load tenants', error: true });
        } finally {
            setLoadingTenants(false);
        }
    };

    const handleBroadcastSend = async (e) => {
        e.preventDefault();
        if (!holidayStart || !holidayEnd) {
            notify({ title: 'Validation Error', message: 'Both dates are required.', error: true });
            return;
        }

        setBroadcastLoading(true);
        try {
            await api.post('/notifications/holiday', {
                startDate: holidayStart,
                endDate: holidayEnd,
                reason: holidayReason
            });
            notify({ title: 'Success', message: 'Holiday notifications sent to all parents.', success: true });
            setHolidayStart('');
            setHolidayEnd('');
            setHolidayReason('');
        } catch (err) {
            notify({ title: 'Error', message: 'Failed to send broadcast.', error: true });
        } finally {
            setBroadcastLoading(false);
        }
    };

    const openNotifyModal = (tenant) => {
        setSelectedTenant(tenant);
        setModalOpened(true);
    };

    const handleIndividualSend = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await api.post(`/tenants/${selectedTenant?.pgNumber}/notify`, {
                type: 'Leave',
                startDate,
                endDate,
                message: leaveReason
            });
            notify({ title: 'Success', message: `Leave notification sent to parents of ${selectedTenant.studentName}.`, success: true });
            setModalOpened(false);
            setStartDate('');
            setEndDate('');
            setLeaveReason('');
        } catch (error) {
            notify({ title: 'Error', message: 'Failed to send notification.', error: true });
        } finally {
            setSending(false);
        }
    };

    const filteredTenants = tenants.filter(t =>
        t.studentName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.pgNumber?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.roomName?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const columns = [
        { header: 'PG Number', key: 'pgNumber' },
        { header: 'Name', key: 'studentName' },
        { header: 'Room/Bed', key: 'roomName', render: (val, t) => `${val || 'N/A'} - ${t.bedNumber || 'N/A'}` },
        { header: 'Status', key: 'status', render: (val) => <Badge color={val === 'ACTIVE' ? 'green' : 'gray'}>{val}</Badge> },
        {
            header: 'Actions',
            key: 'actions',
            render: (_, t) => (
                <Button variant="light" size="compact-xs" onClick={() => openNotifyModal(t)} leftSection={<IconSend size={14} />}>
                    Notify
                </Button>
            )
        }
    ];

    return (
        <div>
            <div className="page-header" style={{ marginBottom: '30px' }}>
                <h2>Notifications Hub</h2>
            </div>

            <Group mb="xl" style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
                <Button
                    variant={activeTab === 'holiday' ? 'filled' : 'light'}
                    size="md"
                    leftSection={<IconUsers size={20} />}
                    onClick={() => setActiveTab('holiday')}
                >
                    Holiday Broadcast (All Parents)
                </Button>
                <Button
                    variant={activeTab === 'individual' ? 'filled' : 'light'}
                    size="md"
                    leftSection={<IconUser size={20} />}
                    onClick={() => setActiveTab('individual')}
                >
                    Individual / Leave Notices
                </Button>
            </Group>

            {activeTab === 'holiday' && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                    <Card shadow="sm" p="xl" radius="md" withBorder style={{ width: '100%', maxWidth: '900px' }}>
                        <Alert icon={<IconInfoCircle size={16} />} title="Broadcast Alert" color="blue" style={{ backgroundColor: "#dfdfdf" }} mb="xl">
                            Sending this will notify the parents of <b>ALL ACTIVE</b> tenants in the system via SMS and Email.
                        </Alert>
                        <form onSubmit={handleBroadcastSend}>
                            <Stack>
                                <Group grow>
                                    <TextInput
                                        type="date"
                                        label="Holiday Start Date"
                                        value={holidayStart}
                                        onChange={(e) => setHolidayStart(e.target.value)}
                                        required
                                    />
                                    <TextInput
                                        type="date"
                                        label="Holiday End Date"
                                        value={holidayEnd}
                                        onChange={(e) => setHolidayEnd(e.target.value)}
                                        required
                                    />
                                </Group>
                                <TextInput
                                    label="Holiday Reason / Event Name"
                                    placeholder="e.g. Diwali, Summer Vacation, Eid"
                                    value={holidayReason}
                                    onChange={(e) => setHolidayReason(e.target.value)}
                                    required
                                />
                                <Paper p="md" bg="gray.0" radius="md" withBorder>
                                    <Text size="sm" fw={600} mb={5}>Message Preview:</Text>
                                    <Text size="sm" color="dimmed" italic>
                                        "Dear Parent, We would like to inform you that the hostel will remain closed from {holidayStart || '[Start]'} to {holidayEnd || '[End]'} due to {holidayReason || 'holidays'}. Kindly ensure your son/daughter reaches home safely. Thank you."
                                    </Text>
                                </Paper>
                                <Button
                                    type="submit"
                                    size="lg"
                                    loading={broadcastLoading}
                                    leftSection={<IconSend size={20} />}
                                    w="fit-content"
                                    style={{ marginLeft: "auto", marginRight: "auto" }}
                                >
                                    Send Broadcast to All Parents
                                </Button>
                            </Stack>
                        </form>
                    </Card>
                </div>
            )}

            {activeTab === 'individual' && (
                <DataTable
                    title="Select Tenant to Notify"
                    columns={columns}
                    data={filteredTenants}
                    loading={loadingTenants}
                    search={search}
                    onSearch={setSearch}
                />
            )}

            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title={`Leave Request Notification - ${selectedTenant?.studentName}`}
                centered
                size="lg"
            >
                <form onSubmit={handleIndividualSend}>
                    <Stack>
                        <TextInput
                            label="Reason for Leave"
                            placeholder="e.g. Going home for festival, Family function"
                            value={leaveReason}
                            onChange={(e) => setLeaveReason(e.target.value)}
                            required
                        />

                        <Group grow>
                            <TextInput
                                type="date"
                                label="From Date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                            <TextInput
                                type="date"
                                label="To Date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </Group>

                        <Paper p="sm" bg="gray.0" radius="md" withBorder>
                            <Text size="xs" fw={600}>Message Preview:</Text>
                            <Text size="xs" color="dimmed" italic>
                                Dear Parent, this is to inform you that <b>{selectedTenant?.studentName}</b> has requested leave for <b>{leaveReason || "[Reason]"}</b> from <b>{startDate || "[Start]"}</b> to <b>{endDate || "[End]"}</b>. Please take note of this request. Thank you.
                            </Text>
                        </Paper>

                        <Group justify="flex-end">
                            <Button variant="outline" color="gray" onClick={() => setModalOpened(false)}>Cancel</Button>
                            <Button type="submit" loading={sending} leftSection={<IconSend size={16} />}>Send Notification</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </div>
    );
};

export default NotificationsHub;
