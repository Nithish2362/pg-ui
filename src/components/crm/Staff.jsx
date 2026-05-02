import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Select, Text, Group, Badge, Textarea, Grid, ActionIcon, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { IconArrowLeft, IconPlus, IconEdit, IconTrash, IconUserShield, IconMapPin, IconBuilding, IconMail } from "@tabler/icons-react";
import api from "../../api/Interceptor";
import notify from "../utils/Notification";
import useDebounce from "../../common/useDebounce";
import DataTable from "../common/DataTable";

const Staff = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const isCreateMode = locationState.pathname === "/staff/create";

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
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    age: "",
    dob: "",
    address: "",
    mobileNumber: "",
    email: "",
    locationId: "",
    buildingId: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      let url = `/admin/staff/view?page=${page - 1}&pageSize=${pageSize}&searchTerm=${debouncedSearch}`;
      if (filterLoc) url += `&locationId=${filterLoc}`;
      if (filterBld) url += `&buildingId=${filterBld}`;

      const [staffRes, locationRes, buildingRes] = await Promise.all([
        api.get(url),
        api.get("/admin/locations/get-all"),
        api.get("/admin/buildings")
      ]);
      setItems(staffRes.data?.response || []);
      setTotalCount(staffRes.data?.count || 0);
      setLocations(locationRes.data?.response || locationRes.data?.data || []);
      setBuildings(buildingRes.data?.response || buildingRes.data?.data || []);
    } catch (err) {
      notify({ title: "Error", message: "Failed to load data", error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, debouncedSearch, pageSize, filterLoc, filterBld]);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/staff/${editingId}`, form);
        notify({ title: "Success", message: "Staff updated successfully", success: true });
      } else {
        await api.post("/admin/staff", form);
        notify({ title: "Success", message: "Staff registered. Credentials sent to email.", success: true });
      }
      resetForm();
      load();
      navigate("/staff");
    } catch (err) {
      notify({ title: "Error", message: err?.response?.data?.message || "Failed to save staff", error: true });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", age: "", dob: "", address: "", mobileNumber: "", email: "", locationId: "", buildingId: "" });
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name || "",
      age: item.age || "",
      dob: item.dob || "",
      address: item.address || "",
      mobileNumber: item.mobileNumber || "",
      email: item.email || "",
      locationId: item.locationId || "",
      buildingId: item.buildingId || "",
    });
    setEditingId(item.id);
    navigate("/staff/create");
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    open();
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/staff/${selectedItem.id}`);
      notify({ title: "Success", message: "Staff removed", success: true });
      close();
      load();
    } catch {
      notify({ title: "Error", message: "Delete failed", error: true });
    }
  };

  const columns = [
    { header: "Staff NO", key: "staffNumber", render: (val) => <strong>{val}</strong> },
    { header: "Name", key: "name" },
    { header: "Mobile", key: "mobileNumber" },
    { header: "Email", key: "email", render: (val) => val || "—" },
    { header: "Building", key: "buildingName", render: (val) => val || "Not Assigned" },
    { 
      header: "Status", 
      key: "status", 
      render: (val) => <Badge color={val === "ACTIVE" ? "green" : "red"}>{val}</Badge> 
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, t) => (
        <Group gap="xs" justify="center">
          <Tooltip label="Edit">
            <ActionIcon variant="light" color="yellow" size="sm" onClick={() => handleEdit(t)}>
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Remove">
            <ActionIcon variant="light" color="red" size="sm" onClick={() => openDeleteModal(t)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )
    }
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'md' }}>
        <Group align="center" gap="xl">
          <h2>Staff Management</h2>
          {!isCreateMode && (
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
        
        {!isCreateMode ? (
          <Button onClick={() => { resetForm(); navigate("/staff/create"); }} leftSection={<IconPlus size={18} />} size="sm">
            Register New Staff
          </Button>
        ) : (
          <Button onClick={() => navigate("/staff")} variant="outline" leftSection={<IconArrowLeft size={18} />} size="sm">
            Back
          </Button>
        )}
      </div>

      {isCreateMode ? (
        <div className="form-card">
          <Group gap="sm" mb="xl">
            <IconUserShield size={24} color="#3f92c5" />
            <h3 style={{ margin: 0 }}>{editingId ? "Edit Staff" : "Register New Staff"}</h3>
          </Group>

          <form onSubmit={save}>
            <Grid gutter="md">
              <Grid.Col span={4}>
                <TextInput label="Full Name *" placeholder="Staff Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput label="Mobile Number *" placeholder="10 Digits" value={form.mobileNumber} onChange={e => setForm({ ...form, mobileNumber: e.target.value })} required />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput label="Email Address *" placeholder="staff@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput label="Date of Birth *" type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} required />
              </Grid.Col>
              <Grid.Col span={2}>
                <TextInput label="Age" type="number" placeholder="Years" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
              </Grid.Col>
              <Grid.Col span={6}>
                <Textarea label="Address" placeholder="Full permanent address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} autosize minRows={1} />
              </Grid.Col>

              <Grid.Col span={12} mt="sm">
                <Group gap={8}>
                  <IconBuilding size={20} color="#3f92c5" />
                  <Text fw={600} size="sm" c="blue">Work Assignment</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Select Location"
                  placeholder="Choose Location"
                  data={locations.map(l => ({ value: l.locationId, label: l.locationName }))}
                  value={form.locationId}
                  onChange={val => setForm({ ...form, locationId: val, buildingId: "" })}
                  searchable
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Assign Building"
                  placeholder={form.locationId ? "Choose Building" : "Select location first"}
                  data={buildings.filter(b => b.locationId === form.locationId).map(b => ({ value: b.buildingId, label: b.buildingName }))}
                  value={form.buildingId}
                  onChange={val => setForm({ ...form, buildingId: val })}
                  searchable
                  disabled={!form.locationId}
                />
              </Grid.Col>
            </Grid>

            <Group justify="center" mt="xl">
              <Button type="submit" size="md">
                {editingId ? "Update Staff" : "Register Staff"}
              </Button>
            </Group>
          </form>
        </div>
      ) : (
        <>
          <DataTable
            title="All Staff Members"
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
        </>
      )}

      <Modal opened={opened} onClose={close} title="Remove Staff" centered>
        <Text size="sm">Are you sure you want to remove <strong>{selectedItem?.name}</strong> from the system?</Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="gray" onClick={close}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Remove</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default Staff;
