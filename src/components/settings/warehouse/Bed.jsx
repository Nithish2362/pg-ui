import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Select, Text, Group, Badge, Switch, ActionIcon, Tooltip } from "@mantine/core";
import { IconArrowLeft, IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/Interceptor";
import notify from "../../utils/Notification";

import useDebounce from "../../../common/useDebounce";
import DataTable from "../../common/DataTable";

const Beds = () => {
  const locationState = useLocation();
  const navigate = useNavigate();
  const isCreateMode = locationState.pathname === "/beds/create";
  const queryParams = new URLSearchParams(locationState.search);
  const preSelectedRoomId = queryParams.get("roomId");

  const [locations, setLocations] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [beds, setBeds] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);

  const [form, setForm] = useState({
    bedNumber: "",
    isOccupied: false,
    bedId: "",
    roomId: preSelectedRoomId || "",
  });

  const [editingId, setEditingId] = useState(null);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (preSelectedRoomId) {
      setForm((f) => ({ ...f, roomId: preSelectedRoomId }));
    }
  }, [preSelectedRoomId]);

  // ================== LOAD DATA ==================
  const load = async () => {
    try {
      setLoading(true);
      const [bedRes, roomRes, floorRes, buildingRes, locationRes] = await Promise.all([
        api.get(`/admin/beds/view?page=${page - 1}&pageSize=${pageSize}&searchTerm=${debouncedSearch}`),
        api.get("/admin/rooms"),
        api.get("/admin/floors"),
        api.get("/admin/buildings"),
        api.get("/admin/locations/get-all"),
      ]);

      setBeds(bedRes.data?.response || []);
      setTotalCount(bedRes.data?.count || 0);
      setRooms(roomRes.data?.response || roomRes.data?.data || roomRes.data || []);
      setFloors(floorRes.data?.response || floorRes.data?.data || floorRes.data || []);
      setBuildings(buildingRes.data?.response || buildingRes.data?.data || buildingRes.data || []);
      setLocations(locationRes.data?.response || locationRes.data?.data || locationRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      notify({
        title: "Error!",
        message: "Failed to load beds or rooms.",
        success: false,
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, debouncedSearch, pageSize]);

  // ================== SAVE / UPDATE ==================
  const save = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/admin/beds/${editingId}`, form);
        notify({
          title: "Updated!",
          message: "Bed updated successfully.",
          success: true,
        });
      } else {
        await api.post("/admin/beds", form);
        notify({
          title: "Success!",
          message: "Bed created successfully.",
          success: true,
        });
      }

      setForm({ bedNumber: "", isOccupied: false, bedId: "", roomId: "" });
      setEditingId(null);
      load();
      navigate("/beds");
    } catch (error) {
      console.error(error);
      notify({
        title: "Error!",
        message: error.response?.data?.message || "Failed to save bed.",
        success: false,
        error: true,
      });
    }
  };

  // ================== EDIT / DELETE ==================
  const handleEdit = (item) => {
    // Cascading state restoration
    const room = rooms.find(r => r.roomId === item.roomId);
    if (room) {
      setSelectedFloor(room.floorId);
      const floor = floors.find(f => f.floorId === room.floorId);
      if (floor) {
        setSelectedBuilding(floor.buildingId);
        const building = buildings.find(b => b.buildingId === floor.buildingId);
        if (building) {
          setSelectedLocation(building.locationId);
        }
      }
    }

    setForm({
      bedNumber: item.bedNumber || "",
      isOccupied: item.isOccupied || false,
      bedId: item.bedId || "",
      roomId: item.roomId || "",
    });
    setEditingId(item.bedId);
    navigate("/beds/create");
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    open();
  };

  const confirmDelete = async () => {
    if (!selectedItem?.bedId) return;

    try {
      await api.delete(`/admin/beds/${selectedItem.bedId}`);
      notify({
        title: "Deleted!",
        message: "Bed deleted successfully.",
        success: true,
      });
      close();
      load();
    } catch (error) {
      notify({
        title: "Error!",
        message: "Unable to delete bed.",
        success: false,
        error: true,
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ bedNumber: "", isOccupied: false, bedId: "", roomId: "" });
    setSelectedLocation("");
    setSelectedBuilding("");
    setSelectedFloor("");
    navigate("/beds");
  };

  const getRoomNumber = (id) => {
    const room = rooms.find((x) => x.roomId === id);
    return room ? room.roomNumber : id;
  };

  const columns = [
    { header: "Bed ID", key: "bedId", render: (val) => <strong>{val}</strong> },
    { header: "Bed Number", key: "bedNumber" },
    { header: "Room", key: "roomId", render: (val) => getRoomNumber(val) },
    {
      header: "Occupied", key: "isOccupied", render: (val) => (
        <Badge color={val ? "red" : "green"} variant="light">
          {val ? "Yes" : "No"}
        </Badge>
      )
    },
    {
      header: "Actions", key: "actions", render: (_, b) => (
        <Group gap="xs" justify="center" wrap="nowrap">
          <Tooltip label="Edit Bed">
            <ActionIcon variant="light" color="yellow" size="sm" onClick={() => handleEdit(b)}>
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Bed">
            <ActionIcon variant="light" color="red" size="sm" onClick={() => openDeleteModal(b)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )
    }
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Bed Management</h2>
        {!isCreateMode ? (
          <Button onClick={() => navigate("/beds/create")}>
            <IconPlus size={18} style={{ marginRight: "5px" }} /> Create Bed
          </Button>
        ) : (
          <Button onClick={() => navigate("/beds")} variant="outline" leftSection={<IconArrowLeft size={18} />}>
            Back
          </Button>
        )}
      </div>

      {isCreateMode ? (
        <div className="form-card">
          <h3 style={{ marginBottom: "15px" }}>
            {editingId ? "Edit Bed" : "Add New Bed"}
          </h3>

          <form onSubmit={save}>
            <div className="form-grid">
              <div className="form-group">
                <label>Location</label>
                <Select
                  placeholder="Select Location"
                  data={locations.map((l) => ({ value: l.locationId, label: l.locationName }))}
                  value={selectedLocation}
                  onChange={(val) => {
                    setSelectedLocation(val);
                    setSelectedBuilding("");
                    setSelectedFloor("");
                    setForm({ ...form, roomId: "" });
                  }}
                  disabled={!!editingId}
                  searchable
                  required
                />
              </div>

              <div className="form-group">
                <label>Building</label>
                <Select
                  placeholder={selectedLocation ? "Select Building" : "Select Location First"}
                  data={buildings.filter(b => b.locationId === selectedLocation).map((b) => ({ value: b.buildingId, label: b.buildingName }))}
                  value={selectedBuilding}
                  onChange={(val) => {
                    setSelectedBuilding(val);
                    setSelectedFloor("");
                    setForm({ ...form, roomId: "" });
                  }}
                  disabled={!selectedLocation || !!editingId}
                  searchable
                  required
                />
              </div>

              <div className="form-group">
                <label>Floor</label>
                <Select
                  placeholder={selectedBuilding ? "Select Floor" : "Select Building First"}
                  data={floors.filter(f => f.buildingId === selectedBuilding).map((f) => ({ value: f.floorId, label: f.floorName }))}
                  value={selectedFloor}
                  onChange={(val) => {
                    setSelectedFloor(val);
                    setForm({ ...form, roomId: "" });
                  }}
                  disabled={!selectedBuilding || !!editingId}
                  searchable
                  required
                />
              </div>

              <div className="form-group">
                <label>Room</label>
                <Select
                  placeholder={selectedFloor ? "Select Room" : "Select Floor First"}
                  data={rooms.filter(r => r.floorId === selectedFloor).map((r) => ({ value: r.roomId, label: `Room ${r.roomNumber} (${r.roomId})` }))}
                  value={form.roomId}
                  onChange={(val) => setForm({ ...form, roomId: val })}
                  disabled={!selectedFloor || !!editingId}
                  searchable
                  required
                />
              </div>

              <div className="form-group">
                <label>Bed Number</label>
                <TextInput
                  placeholder="e.g. B1"
                  value={form.bedNumber}
                  onChange={(e) => setForm({ ...form, bedNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '25px' }}>
                <Switch
                  label="Is Occupied?"
                  checked={form.isOccupied}
                  onChange={(event) => setForm({ ...form, isOccupied: event.currentTarget.checked })}
                />
              </div>
            </div>

            <Group justify="center" mt="xl">
              <Button type="submit">
                {editingId ? "Update Bed" : "Add Bed"}
              </Button>
              {editingId && (
                <Button variant="outline" color="gray" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </Group>
          </form>
        </div>
      ) : (
        <DataTable
          title="All Beds"
          columns={columns}
          data={beds}
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
      )}

      <Modal opened={opened} onClose={close} title="Delete Bed" styles={{
        title: {
          fontSize: "18px",
          fontWeight: 600,
          color: "#e03131", // red color
        },
      }} centered>
        <Text size="sm">
          Are you sure you want to delete bed <strong>{selectedItem?.bedNumber}</strong>? This action cannot be undone.
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="gray" onClick={close}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default Beds;
