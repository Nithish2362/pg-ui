import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Select, Text, Group, Badge, NumberInput, ActionIcon, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { IconArrowRight, IconArrowLeft, IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import api from "../../../api/Interceptor";
import notify from "../../utils/Notification";

import useDebounce from "../../../common/useDebounce";
import DataTable from "../../common/DataTable";

const Rooms = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const isCreateMode = locationState.pathname === "/rooms/create";
  const queryParams = new URLSearchParams(locationState.search);
  const preSelectedFloorId = queryParams.get("floorId");

  const [locations, setLocations] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);

  const [form, setForm] = useState({
    roomNumber: "",
    roomType: "AC",
    sharingType: 2,
    monthlyRent: "",
    totalBeds: 2,
    roomId: "",
    floorId: preSelectedFloorId || "",
  });

  const [editingId, setEditingId] = useState(null);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (preSelectedFloorId) {
      setForm((f) => ({ ...f, floorId: preSelectedFloorId }));
    }
  }, [preSelectedFloorId]);

  // ================== LOAD DATA ==================
  const load = async () => {
    try {
      setLoading(true);
      const [roomRes, floorRes, buildingRes, locationRes] = await Promise.all([
        api.get(`/admin/rooms/view?page=${page - 1}&pageSize=${pageSize}&searchTerm=${debouncedSearch}`),
        api.get("/admin/floors"),
        api.get("/admin/buildings"),
        api.get("/admin/locations/get-all"),
      ]);

      setRooms(roomRes.data?.response || []);
      setTotalCount(roomRes.data?.count || 0);
      setFloors(floorRes.data?.response || floorRes.data?.data || floorRes.data || []);
      setBuildings(buildingRes.data?.response || buildingRes.data?.data || buildingRes.data || []);
      setLocations(locationRes.data?.response || locationRes.data?.data || locationRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      notify({
        title: "Error!",
        message: "Failed to load rooms or floors.",
        success: false,
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, debouncedSearch]);

  // ================== SAVE / UPDATE ==================
  const save = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      sharingType: parseInt(form.sharingType),
      monthlyRent: parseFloat(form.monthlyRent),
      totalBeds: parseInt(form.totalBeds),
    };

    try {
      if (editingId) {
        await api.put(`/admin/rooms/${editingId}`, payload);
        notify({
          title: "Updated!",
          message: "Room updated successfully.",
          success: true,
        });
      } else {
        await api.post("/admin/rooms", payload);
        notify({
          title: "Success!",
          message: "Room created successfully.",
          success: true,
        });
      }

      setForm({
        roomNumber: "",
        roomType: "AC",
        sharingType: 2,
        monthlyRent: "",
        totalBeds: "",
        roomId: "",
        floorId: "",
      });
      setEditingId(null);
      load();
      navigate("/rooms");
    } catch (error) {
      console.error(error);
      notify({
        title: "Error!",
        message: error.response?.data?.message || "Failed to save room.",
        success: false,
        error: true,
      });
    }
  };

  // ================== EDIT / DELETE ==================
  const handleEdit = (item) => {
    // Find building from floor, and location from building
    const floor = floors.find(f => f.floorId === item.floorId);
    if (floor) {
      setSelectedBuilding(floor.buildingId);
      const building = buildings.find(b => b.buildingId === floor.buildingId);
      if (building) {
        setSelectedLocation(building.locationId);
      }
    }

    setForm({
      roomNumber: item.roomNumber || "",
      roomType: item.roomType || "AC",
      sharingType: item.sharingType || 2,
      monthlyRent: item.monthlyRent || "",
      totalBeds: item.totalBeds || "",
      roomId: item.roomId || "",
      floorId: item.floorId || "",
    });
    setEditingId(item.roomId);
    navigate("/rooms/create");
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    open();
  };

  const confirmDelete = async () => {
    if (!selectedItem?.roomId) return;

    try {
      await api.delete(`/admin/rooms/${selectedItem.roomId}`);
      notify({
        title: "Deleted!",
        message: "Room deleted successfully.",
        success: true,
      });
      close();
      load();
    } catch (error) {
      notify({
        title: "Error!",
        message: "Unable to delete room.",
        success: false,
        error: true,
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      roomNumber: "",
      roomType: "AC",
      sharingType: 2,
      monthlyRent: "",
      totalBeds: "",
      roomId: "",
      floorId: "",
    });
    setSelectedLocation("");
    setSelectedBuilding("");
    navigate("/rooms");
  };

  const getFloorName = (id) => {
    const floor = floors.find((x) => x.floorId === id);
    return floor ? floor.floorName : id;
  };

  const columns = [
    { header: "Room ID", key: "roomId", render: (val) => <strong>{val}</strong> },
    { header: "Room #", key: "roomNumber" },
    { header: "Floor", key: "floorId", render: (val) => getFloorName(val) },
    { header: "Type", key: "roomType", render: (val) => (
      <Badge color={val === "AC" ? "blue" : "orange"} variant="light">
        {val}
      </Badge>
    )},
    { header: "Sharing", key: "sharingType", render: (val) => `${val} Sharing` },
    { header: "Rent", key: "monthlyRent", render: (val) => `₹${val}` },
    { header: "Beds", key: "totalBeds", render: (val, r) => r.beds?.length || val },
    { header: "Actions", key: "actions", render: (_, r) => (
      <Group gap="xs" justify="center" wrap="nowrap">
        <Tooltip label="Edit Room">
          <ActionIcon variant="light" color="yellow" size="sm" onClick={() => handleEdit(r)}>
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete Room">
          <ActionIcon variant="light" color="red" size="sm" onClick={() => openDeleteModal(r)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Go To Beds">
          <ActionIcon variant="light" color="blue" size="sm" onClick={() => navigate(`/beds?roomId=${r.roomId}`)}>
            <IconArrowRight size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    )}
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Room Management</h2>
        {!isCreateMode ? (
          <Button onClick={() => navigate("/rooms/create")}>
            <IconPlus size={18} style={{ marginRight: "5px" }} /> Create Room
          </Button>
        ) : (
          <Button onClick={() => navigate("/rooms")} variant="outline" leftSection={<IconArrowLeft size={18} />}>
            Back
          </Button>
        )}
      </div>

      {isCreateMode ? (
        <div className="form-card">
          <h3 style={{ marginBottom: "15px" }}>
            {editingId ? "Edit Room" : "Add New Room"}
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
                    setForm({ ...form, floorId: "" });
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
                    setForm({ ...form, floorId: "" });
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
                  value={form.floorId}
                  onChange={(val) => setForm({ ...form, floorId: val })}
                  disabled={!selectedBuilding || !!editingId}
                  searchable
                  required
                />
              </div>

              <div className="form-group">
                <label>Room Number</label>
                <TextInput
                  placeholder="e.g. 101"
                  value={form.roomNumber}
                  onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Room Type</label>
                <Select
                  data={[
                    { value: "AC", label: "AC" },
                    { value: "NON_AC", label: "Non-AC" },
                  ]}
                  value={form.roomType}
                  onChange={(val) => setForm({ ...form, roomType: val })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Sharing Type</label>
                <Select
                  data={[
                    { value: "1", label: "1 Sharing" },
                    { value: "2", label: "2 Sharing" },
                    { value: "3", label: "3 Sharing" },
                    { value: "4", label: "4 Sharing" },
                    { value: "5", label: "5 Sharing" },
                    { value: "6", label: "6 Sharing" },

                  ]}
                  value={form.sharingType}
                  onChange={(val) =>
                    setForm({
                      ...form,
                      sharingType: val,
                      totalBeds: val, // auto set beds same as sharing
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Monthly Rent (₹)</label>
                <TextInput
                  type="number"
                  placeholder="Rent amount"
                  value={form.monthlyRent}
                  onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Beds</label>
                <TextInput
                  type="number"
                  placeholder="Number of beds"
                  value={form.totalBeds}
                  required
                />
              </div>
            </div>

            <Group justify="center" mt="xl">
              <Button type="submit">
                {editingId ? "Update Room" : "Save Room"}
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
          title="All Rooms"
          columns={columns}
          data={rooms}
          loading={loading}
          search={search}
          onSearch={setSearch}
          totalCount={totalCount}
          page={page}
          totalPages={Math.ceil(totalCount / pageSize)}
          onPageChange={setPage}
        />
      )}

      <Modal opened={opened} onClose={close} title="Delete Room" styles={{
        title: {
          fontSize: "18px",
          fontWeight: 600,
          color: "#e03131", // red color
        },
      }} centered>
        <Text size="sm">
          Are you sure you want to delete room <strong>{selectedItem?.roomNumber}</strong>? This action cannot be undone.
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="gray" onClick={close}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default Rooms;
