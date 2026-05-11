import React, { useState, useEffect } from 'react';
import { Tabs, Paper, Text, Group, Button, TextInput, Textarea, Stack, Card, Alert, Modal, Badge, Select } from '@mantine/core';
import { IconSend, IconInfoCircle, IconUsers, IconUser, IconSpeakerphone } from '@tabler/icons-react';
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
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
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
    }, [activeTab, page, debouncedSearch, pageSize]);

    const loadTenants = async () => {
        try {
            setLoadingTenants(true);
            const res = await api.get(`/admin/tenants/view?page=${page - 1}&pageSize=${pageSize}&searchTerm=${debouncedSearch}&status=ACTIVE`);
            setTenants(res.data?.response || []);
            setTotalCount(res.data?.count || 0);
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

    const columns = [
        { header: 'PG ID', key: 'pgNumber', render: (val) => <Text fw={700}>{val}</Text> },
        { header: 'Resident Name', key: 'studentName', render: (val) => <Text fw={600}>{val}</Text> },
        { header: 'Allocation', key: 'roomName', render: (val, t) => `${val || 'N/A'} • Bed ${t.bedNumber || 'N/A'}` },
        { header: 'Status', key: 'status', render: (val) => <Badge variant="light" color={val === 'ACTIVE' ? 'green' : 'gray'}>{val}</Badge> },
        {
            header: 'Actions',
            key: 'actions',
            render: (_, t) => (
                <Button
                    variant="light"
                    color="brand"
                    size="compact-sm"
                    radius="md"
                    onClick={() => openNotifyModal(t)}
                    leftSection={<IconSend size={14} />}
                >
                    Notify Parent
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: '10px' }}>
            <div className="page-header">
                <Group align="center" gap="sm">
                    <IconSpeakerphone size={32} color="var(--gold)" />
                    <h2>Communications Center</h2>
                </Group>

                <Group mb="30px" justify="center">
                    <Button
                        variant={activeTab === 'holiday' ? 'filled' : 'light'}
                        color={activeTab === 'holiday' ? 'dark' : 'gray'}
                        size="lg"
                        radius="xl"
                        leftSection={<IconSpeakerphone size={22} />}
                        onClick={() => setActiveTab('holiday')}
                        style={{ transition: 'all 0.3s ease' }}
                    >
                        Holiday Broadcast
                    </Button>
                    <Button
                        variant={activeTab === 'individual' ? 'filled' : 'light'}
                        color={activeTab === 'individual' ? 'dark' : 'gray'}
                        size="lg"
                        radius="xl"
                        leftSection={<IconUser size={22} />}
                        onClick={() => setActiveTab('individual')}
                        style={{ transition: 'all 0.3s ease' }}
                    >
                        Individual Notices
                    </Button>
                </Group>
            </div>
            {activeTab === 'holiday' && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Card p="40px" radius="40px" withBorder style={{
                        width: '100%',
                        maxWidth: "100%",
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <Alert
                            icon={<IconInfoCircle size={20} />}
                            title="Global Broadcast Protocol"
                            color="brand"
                            variant="light"
                            radius="lg"
                            mb="30px"
                        >
                            This action will transmit an automated SMS and Email alert to the parents of <b>ALL ACTIVE</b> residents.
                        </Alert>

                        <form onSubmit={handleBroadcastSend}>
                            <Stack gap="xl" justify="center">
                                <Group grow>
                                    <TextInput
                                        type="date"
                                        label="Commencement Date"
                                        value={holidayStart}
                                        onChange={(e) => setHolidayStart(e.target.value)}
                                        required
                                        size="md"
                                        radius="md"
                                    />
                                    <TextInput
                                        type="date"
                                        label="Conclusion Date"
                                        value={holidayEnd}
                                        onChange={(e) => setHolidayEnd(e.target.value)}
                                        required
                                        size="md"
                                        radius="md"
                                    />
                                </Group>
                                <TextInput
                                    label="Occasion / Context"
                                    placeholder="e.g. Annual Break, Festival Holiday"
                                    value={holidayReason}
                                    onChange={(e) => setHolidayReason(e.target.value)}
                                    required
                                    size="md"
                                    radius="md"
                                />

                                <Paper p="xl" bg="gray.0" radius="24px" withBorder>
                                    <Text size="xs" fw={800} tt="uppercase" c="dimmed" mb="sm" style={{ letterSpacing: '0.05em' }}>Communication Preview</Text>
                                    <Text size="sm" c="dark" italic lh={1.6}>
                                        "Dear Parent, We would like to inform you that the hostel will remain closed from <b>{holidayStart || '[Start Date]'}</b> to <b>{holidayEnd || '[End Date]'}</b> due to <b>{holidayReason || '[Context]'}</b>. Kindly ensure your ward reaches home safely. Best regards, StayWow Management."
                                    </Text>
                                </Paper>

                                <Button
                                    type="submit"
                                    size="xl"
                                    radius="xl"
                                    loading={broadcastLoading}
                                    leftSection={<IconSend size={20} />}
                                    className="btn-premium"
                                    w="100%"
                                >
                                    Authorize Global Broadcast
                                </Button>
                            </Stack>
                        </form>
                    </Card>
                </div>
            )}

            {activeTab === 'individual' && (
                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                    <DataTable
                        title="Resident Registry"
                        columns={columns}
                        data={tenants}
                        loading={loadingTenants}
                        search={search}
                        onSearch={setSearch}
                        totalCount={totalCount}
                        page={page}
                        totalPages={Math.ceil(totalCount / pageSize)}
                        onPageChange={setPage}
                        pageSize={pageSize}
                        onPageSizeChange={setPageSize}
                    />
                </div>
            )}

            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title={<Text fw={900} size="xl">Leave Authorization</Text>}
                centered
                size="lg"
                radius="32px"
                padding="30px"
            >
                <form onSubmit={handleIndividualSend}>
                    <Stack gap="xl">
                        <Text size="sm" c="dimmed">Drafting leave notification for <b>{selectedTenant?.studentName}</b>.</Text>

                        <TextInput
                            label="Reason for Absence"
                            placeholder="Briefly state the context"
                            value={leaveReason}
                            onChange={(e) => setLeaveReason(e.target.value)}
                            required
                            size="md"
                            radius="md"
                        />

                        <Group grow>
                            <TextInput
                                type="date"
                                label="From"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                size="md"
                                radius="md"
                            />
                            <TextInput
                                type="date"
                                label="To"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                                size="md"
                                radius="md"
                            />
                        </Group>

                        <Paper p="lg" bg="gray.0" radius="20px" withBorder>
                            <Text size="xs" fw={800} tt="uppercase" c="dimmed" mb={5}>Message Preview</Text>
                            <Text size="sm" c="dark" italic>
                                Dear Parent, this is to inform you that <b>{selectedTenant?.studentName}</b> has requested leave for <b>{leaveReason || "[Reason]"}</b> from <b>{startDate || "[Start]"}</b> to <b>{endDate || "[End]"}</b>. Please acknowledge. Thank you.
                            </Text>
                        </Paper>

                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" color="gray" onClick={() => setModalOpened(false)} radius="md">Cancel</Button>
                            <Button type="submit" loading={sending} radius="xl" className="btn-premium" leftSection={<IconSend size={18} />}>Send Notification</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </div>
    );
};

export default NotificationsHub;
