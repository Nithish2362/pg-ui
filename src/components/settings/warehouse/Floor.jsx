import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Select, Text, Group, ActionIcon, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { IconArrowRight, IconArrowLeft, IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import api from "../../../api/Interceptor";
import notify from "../../utils/Notification";
import useDebounce from "../../../common/useDebounce";
import DataTable from "../../common/DataTable";

const Floors = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const isCreateMode = locationState.pathname === "/floors/create";
  const queryParams = new URLSearchParams(locationState.search);
  const preSelectedBuildingId = queryParams.get("buildingId");

  const [locations, setLocations] = useState([]);
  const [floors, setFloors] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Filters
  const [filterLoc, setFilterLoc] = useState(null);
  const [filterBld, setFilterBld] = useState(null);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);

  const [form, setForm] = useState({
    floorNumber: "",
    floorName: "",
    floorId: "",
    buildingId: preSelectedBuildingId || "",
  });

  const [editingId, setEditingId] = useState(null);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (preSelectedBuildingId) {
      setForm((f) => ({ ...f, buildingId: preSelectedBuildingId }));
    }
  }, [preSelectedBuildingId]);

  // ================== LOAD DATA ==================
  const load = async () => {
    try {
      setLoading(true);
      let url = `/admin/floors/view?page=${page - 1}&pageSize=${pageSize}&searchTerm=${debouncedSearch}`;
      if (filterLoc) url += `&locationId=${filterLoc}`;
      if (filterBld) url += `&buildingId=${filterBld}`;

      const [floorRes, buildingRes, locationRes] = await Promise.all([
        api.get(url),
        api.get("/admin/buildings"),
        api.get("/admin/locations/get-all"),
      ]);

      setFloors(floorRes.data?.response || []);
      setTotalCount(floorRes.data?.count || 0);
      setBuildings(buildingRes.data?.response || buildingRes.data?.data || buildingRes.data || []);
      setLocations(locationRes.data?.response || locationRes.data?.data || locationRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      notify({ title: "Error!", message: "Failed to load floors.", error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, debouncedSearch, pageSize, filterLoc, filterBld]);

  // ================== SAVE / UPDATE ==================
  const save = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/floors/${editingId}`, { ...form });
        notify({ title: "Updated!", message: "Floor updated successfully.", success: true });
      } else {
        await api.post(`/admin/floors?buildingId=${form.buildingId}`, { floorNumber: form.floorNumber, floorName: form.floorName });
        notify({ title: "Success!", message: "Floor created successfully.", success: true });
      }
      setForm({ floorNumber: "", floorName: "", floorId: "", buildingId: "" });
      setEditingId(null);
      load();
      navigate("/floors");
    } catch (error) {
      notify({ title: "Error!", message: error.response?.data?.message || "Failed to save floor.", error: true });
    }
  };

  const handleEdit = (item) => {
    const building = buildings.find(b => b.buildingId === item.buildingId);
    if (building) setSelectedLocation(building.locationId);
    setForm({ floorNumber: item.floorNumber || "", floorName: item.floorName || "", floorId: item.floorId || "", buildingId: item.buildingId || "" });
    setEditingId(item.floorId);
    navigate("/floors/create");
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    open();
  };

  const confirmDelete = async () => {
    if (!selectedItem?.floorId) return;
    try {
      await api.delete(`/admin/floors/${selectedItem.floorId}`);
      notify({ title: "Deleted!", message: "Floor deleted successfully.", success: true });
      close();
      load();
    } catch (error) {
      notify({ title: "Error!", message: "Unable to delete floor.", error: true });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ floorNumber: "", floorName: "", floorId: "", buildingId: "" });
    setSelectedLocation("");
    navigate("/floors");
  };

  const columns = [
    { header: "Floor ID", key: "floorId", render: (val) => <strong>{val}</strong> },
    { header: "Floor NO", key: "floorNumber" },
    { header: "Name", key: "floorName" },
    { header: "Building", key: "buildingName" },
    { header: "Rooms", key: "rooms", render: (val) => val?.length || 0 },
    {
      header: "Actions", key: "actions", render: (_, f) => (
        <Group gap="xs" justify="center" wrap="nowrap">
          <Tooltip label="Edit Floor"><ActionIcon variant="light" color="yellow" size="sm" onClick={() => handleEdit(f)}><IconEdit size={16} /></ActionIcon></Tooltip>
          <Tooltip label="Delete Floor"><ActionIcon variant="light" color="red" size="sm" onClick={() => openDeleteModal(f)}><IconTrash size={16} /></ActionIcon></Tooltip>
          <Tooltip label="Go To Rooms"><ActionIcon variant="light" color="brand" size="sm" onClick={() => navigate(`/rooms?floorId=${f.floorId}`)}><IconArrowRight size={16} /></ActionIcon></Tooltip>
        </Group>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <Group align="center" gap="xl">
          <h2>Floor Logistics</h2>
          {!isCreateMode && (
            <Group gap="sm">
              <Select
                placeholder="Select Location"
                data={locations.map(l => ({ value: l.locationId, label: l.locationName }))}
                value={filterLoc}
                onChange={val => { setFilterLoc(val); setFilterBld(null); }}
                clearable
                size="md"
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
                variant="filled"
              />
            </Group>
          )}
        </Group>

        {!isCreateMode ? (
          <Button onClick={() => navigate("/floors/create")} leftSection={<IconPlus size={18} />} size="sm">Create Floor</Button>
        ) : (
          <Button onClick={() => navigate("/floors")} variant="outline" leftSection={<IconArrowLeft size={18} />} size="sm">Back</Button>
        )}
      </div>

      {
        isCreateMode ? (
          <div className="form-card">
            <h3 style={{ marginBottom: "15px" }}>{editingId ? "Edit Floor" : "Add New Floor"}</h3>
            <form onSubmit={save}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Location</label>
                  <Select placeholder="Select Location" data={locations.map((l) => ({ value: l.locationId, label: l.locationName }))} value={selectedLocation} onChange={(val) => { setSelectedLocation(val); setForm({ ...form, buildingId: "" }); }} disabled={!!editingId} searchable required />
                </div>
                <div className="form-group">
                  <label>Building</label>
                  <Select placeholder={selectedLocation ? "Select Building" : "Select Location First"} data={buildings.filter(b => b.locationId === selectedLocation).map((b) => ({ value: b.buildingId, label: b.buildingName }))} value={form.buildingId} onChange={(val) => setForm({ ...form, buildingId: val })} disabled={!selectedLocation || !!editingId} searchable required />
                </div>
                <div className="form-group">
                  <label>Floor Number</label>
                  <TextInput type="number" placeholder="e.g. 1" value={form.floorNumber} onChange={(e) => setForm({ ...form, floorNumber: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Floor Name</label>
                  <TextInput placeholder="e.g. Ground Floor" value={form.floorName} onChange={(e) => setForm({ ...form, floorName: e.target.value })} required />
                </div>
              </div>
              <Group justify="center" mt="xl">
                <Button type="submit">{editingId ? "Update Floor" : "Save Floor"}</Button>
                {editingId && <Button variant="outline" color="gray" onClick={cancelEdit}>Cancel</Button>}
              </Group>
            </form>
          </div>
        ) : (
          <>
            <DataTable title="All Floors" columns={columns} data={floors} loading={loading} search={search} onSearch={setSearch} totalCount={totalCount} page={page} totalPages={Math.ceil(totalCount / pageSize)} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={setPageSize} />
          </>
        )
      }

      <Modal opened={opened} onClose={close} title="Delete Floor" centered>
        <Text size="sm">Are you sure you want to delete floor <strong>{selectedItem?.floorName}</strong>?</Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="gray" onClick={close}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </div >
  );
};

export default Floors;
