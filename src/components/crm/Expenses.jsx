import React, { useState, useEffect } from "react";
import { Button, TextInput, Select, Text, Group, Badge, Textarea, Grid, ActionIcon, Tooltip, Modal, NumberInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconEdit, IconTrash, IconReceipt, IconCalendar, IconFilter, IconCurrencyRupee, IconBuildingCommunity, IconHome, IconNote, IconCash } from "@tabler/icons-react";
import api from "../../api/Interceptor";
import notify from "../utils/Notification";
import useDebounce from "../../common/useDebounce";
import DataTable from "../common/DataTable";

const Expenses = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isStaff = user.role === 'STAFF';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search, 500);

  // Admin Filters
  const [filterLoc, setFilterLoc] = useState(null);
  const [filterBld, setFilterBld] = useState(null);

  const [opened, { open, close }] = useDisclosure(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const categories = [
    "Electricity Bill",
    "Water Bill",
    "Staff Salary",
    "Maintenance",
    "Repairs",
    "Internet",
    "Food/Catering",
    "Others"
  ];

  const [form, setForm] = useState({
    title: "",
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
    category: "",
    remarks: "",
    locationId: isStaff ? user.locationId : "",
    buildingId: isStaff ? user.buildingId : "",
  });

  const load = async () => {
    try {
      setLoading(true);
      let url = `/admin/expenses/view?page=${page - 1}&pageSize=${pageSize}&searchTerm=${debouncedSearch}`;
      if (!isStaff) {
        if (filterLoc) url += `&locationId=${filterLoc}`;
        if (filterBld) url += `&buildingId=${filterBld}`;
      }

      const [expenseRes, locationRes, buildingRes] = await Promise.all([
        api.get(url),
        api.get("/admin/locations/get-all"),
        api.get("/admin/buildings")
      ]);
      setItems(expenseRes.data?.response || []);
      setTotalCount(expenseRes.data?.count || 0);
      setLocations(locationRes.data?.response || locationRes.data?.data || []);
      setBuildings(buildingRes.data?.response || buildingRes.data?.data || []);
    } catch (err) {
      notify({ title: "Error", message: "Failed to load expenses", error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, debouncedSearch, pageSize, filterLoc, filterBld]);

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.locationId) delete payload.locationId;
      if (!payload.buildingId) delete payload.buildingId;

      if (editingId) {
        await api.put(`/admin/expenses/${editingId}`, payload);
        notify({ title: "Success", message: "Expense updated", success: true });
      } else {
        await api.post("/admin/expenses", payload);
        notify({ title: "Success", message: "Expense recorded", success: true });
      }
      setModalOpened(false);
      resetForm();
      load();
    } catch (err) {
      notify({ title: "Error", message: "Failed to save expense", error: true });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "", amount: 0, expenseDate: new Date().toISOString().split('T')[0],
      category: "", remarks: "",
      locationId: isStaff ? user.locationId : "",
      buildingId: isStaff ? user.buildingId : "",
    });
  };

  const columns = [
    { header: "Expense Date", key: "expenseDate" },
    { header: "Recorded On", key: "createdDate", render: (val) => val ? new Date(val).toLocaleDateString() : "-" },
    { header: "Title", key: "title" },
    { header: "Category", key: "category", render: (val) => <Badge variant="light">{val}</Badge> },
    { header: "Amount", key: "amount", render: (val) => <Text fw={700} c="red">₹{val}</Text> },
    {
      header: "Staff",
      key: "staffName",
      render: (val, row) => (
        <div>
          <Text size="sm" fw={500}>{val}</Text>
          {row.isOldStaff && <Text size="10px" c="red" fw={600} tt="uppercase">Old Staff</Text>}
        </div>
      )
    },
    { header: "Staff ID", key: "staffNumber", render: (val) => <Text size="xs" c="dimmed">{val}</Text> },
    { header: "Location", key: "locationName" },
    { header: "Building", key: "buildingName" },
    {
      header: "Actions",
      key: "actions",
      render: (_, t) => (
        <Group gap="xs" justify="center">
          <ActionIcon variant="light" color="yellow" onClick={() => {
            setForm({
              title: t.title, amount: t.amount, expenseDate: t.expenseDate,
              category: t.category, remarks: t.remarks || "",
              locationId: t.locationId || "", buildingId: t.buildingId || ""
            });
            setEditingId(t.id);
            setModalOpened(true);
          }}><IconEdit size={16} /></ActionIcon>
          <ActionIcon variant="light" color="red" onClick={() => {
            setSelectedItem(t);
            open();
          }}><IconTrash size={16} /></ActionIcon>
        </Group>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <Group align="center" gap="xs">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconCash size={28} color="var(--gold)" />
            {isStaff ? "Building Expenses" : "Expense Management"}
          </h2>
          {!isStaff && (
            <Group gap="xs">
                 <div className="slide-left first-select">
              <Select
                placeholder="Select Location"
                data={locations.map(l => ({ value: l.locationId, label: l.locationName }))}
                value={filterLoc}
                onChange={val => { setFilterLoc(val); setFilterBld(null); setPage(1); }}
                clearable
                size="md"
                variant="filled"
                style={{ width: '180px' }}
              />
              </div>
                 <div className="slide-left second-select">
              <Select
                placeholder="Select Building"
                data={buildings.filter(b => !filterLoc || b.locationId === filterLoc).map(b => ({ value: b.buildingId, label: b.buildingName }))}
                value={filterBld}
                onChange={val => { setFilterBld(val); setPage(1); }}
                clearable
                disabled={!filterLoc}
                size="md"
                variant="filled"
                style={{ width: '180px' }}
              />
              </div>
            </Group>
          )}
        </Group>
        <Button onClick={() => { resetForm(); setModalOpened(true); }} leftSection={<IconPlus size={18} />} size="sm">
          Record Expense
        </Button>
      </div>

      <DataTable
        title={isStaff ? "Recent Building Expenses" : "Global Expense Log"}
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

      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title={editingId ? "Edit Expense Entry" : "Record New Expense"} size="lg" centered>
        <form onSubmit={save}>
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label="Expense Title"
                placeholder="e.g. Electricity Bill"
                leftSection={<IconReceipt size={18} />}
                leftSectionPointerEvents="none"
                leftSectionWidth={40}
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Amount (₹)"
                leftSection={<IconCurrencyRupee size={18} />}
                leftSectionPointerEvents="none"
                leftSectionWidth={40}
                value={form.amount}
                onChange={val => setForm({ ...form, amount: val })}
                required
                min={0}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Expense Date"
                type="date"
                leftSection={<IconCalendar size={18} />}
                leftSectionPointerEvents="none"
                leftSectionWidth={40}
                value={form.expenseDate}
                onChange={e => setForm({ ...form, expenseDate: e.target.value })}
                required
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Expense Category"
                placeholder="Choose a category"
                leftSection={<IconFilter size={18} />}
                leftSectionPointerEvents="none"
                leftSectionWidth={40}
                data={categories}
                value={form.category}
                onChange={val => setForm({ ...form, category: val })}
                required
                searchable
                clearable
                comboboxProps={{ withinPortal: true, zIndex: 10000 }}
              />
            </Grid.Col>

            {!isStaff && (
              <>
                <Grid.Col span={6}>
                  <Select
                    label="Location"
                    placeholder="Select Location"
                    leftSection={<IconBuildingCommunity size={18} />}
                    leftSectionPointerEvents="none"
                    leftSectionWidth={40}
                    data={locations.map(l => ({ value: l.locationId, label: l.locationName }))}
                    value={form.locationId}
                    onChange={val => setForm({ ...form, locationId: val, buildingId: "" })}
                    searchable
                    clearable
                    comboboxProps={{ withinPortal: true, zIndex: 10000 }}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Building"
                    placeholder="Select Building"
                    leftSection={<IconHome size={18} />}
                    leftSectionPointerEvents="none"
                    leftSectionWidth={40}
                    data={buildings.filter(b => b.locationId === form.locationId).map(b => ({ value: b.buildingId, label: b.buildingName }))}
                    value={form.buildingId}
                    onChange={val => setForm({ ...form, buildingId: val })}
                    searchable
                    clearable
                    disabled={!form.locationId}
                    comboboxProps={{ withinPortal: true, zIndex: 10000 }}
                  />
                </Grid.Col>
              </>
            )}

            <Grid.Col span={12}>
              <Textarea
                label="Remarks"
                placeholder="Add notes..."
                leftSection={<IconNote size={18} />}
                leftSectionPointerEvents="none"
                leftSectionWidth={40}
                value={form.remarks}
                onChange={e => setForm({ ...form, remarks: e.target.value })}
                autosize
                minRows={2}
              />
            </Grid.Col>
          </Grid>
          <Group justify="flex-end" mt="xl">
            <Button variant="outline" color="gray" onClick={() => setModalOpened(false)}>Cancel</Button>
            <Button type="submit">Submit Entry</Button>
          </Group>
        </form>
      </Modal>

      <Modal opened={opened} onClose={close} title="Delete Expense" centered>
        <Text size="sm">Are you sure you want to delete this expense record?</Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="gray" onClick={close}>Cancel</Button>
          <Button color="red" onClick={() => {
            api.delete(`/admin/expenses/${selectedItem.id}`).then(() => {
              notify({ message: "Deleted", success: true });
              close(); load();
            }).catch(() => notify({ message: "Failed", error: true }));
          }}>Delete</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default Expenses;
