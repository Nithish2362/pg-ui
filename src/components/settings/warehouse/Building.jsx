import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Select, Text, Group, ActionIcon, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { IconArrowRight, IconArrowLeft, IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import api from "../../../api/Interceptor";
import notify from "../../utils/Notification";

import useDebounce from "../../../common/useDebounce";
import DataTable from "../../common/DataTable";

const Buildings = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const isCreateMode = locationState.pathname === "/buildings/create";
  const queryParams = new URLSearchParams(locationState.search);
  const preSelectedLocationId = queryParams.get("locationId");

  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedItem, setSelectedItem] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);

  const [form, setForm] = useState({
    buildingName: "",
    buildingNumber: "",
    locationId: preSelectedLocationId || "",
  });

  const [editingId, setEditingId] = useState(null);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (preSelectedLocationId) {
      setForm((f) => ({ ...f, locationId: preSelectedLocationId }));
    }
  }, [preSelectedLocationId]);

  // ================== LOAD DATA ==================
  const load = async () => {
    try {
      setLoading(true);
      const [buildingRes, locationRes] = await Promise.all([
        api.get(`/admin/buildings/view?page=${page - 1}&pageSize=${pageSize}&searchTerm=${debouncedSearch}`),
        api.get("/admin/locations/get-all"),
      ]);

      setItems(buildingRes.data?.response || []);
      setTotalCount(buildingRes.data?.count || 0);
      setLocations(locationRes.data?.response || locationRes.data?.data || locationRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      notify({
        title: "Error!",
        message: "Failed to load buildings or locations.",
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

    try {
      if (editingId) {
        await api.put(`/admin/buildings/${editingId}`, {
          buildingName: form.buildingName,
          buildingNumber: form.buildingNumber,
          locationId: form.locationId,
        });

        notify({
          title: "Updated!",
          message: "Building updated successfully.",
          success: true,
        });
      } else {
        await api.post(`/admin/buildings?locationId=${form.locationId}`, {
          buildingName: form.buildingName,
        });

        notify({
          title: "Success!",
          message: "Building created successfully.",
          success: true,
        });
      }

      setForm({ buildingName: "", buildingNumber: "", locationId: "" });
      setEditingId(null);
      load();
      navigate("/buildings");
    } catch (error) {
      console.error(error);
      notify({
        title: "Error!",
        message: error.response?.data?.message || "Failed to save building.",
        success: false,
        error: true,
      });
    }
  };

  // ================== EDIT / DELETE ==================
  const handleEdit = (item) => {
    setForm({
      buildingName: item.buildingName || "",
      buildingNumber: item.buildingNumber || "",
      locationId: item.locationId || "",
    });
    setEditingId(item.buildingId); // Using business ID for the URL path
    navigate("/buildings/create");
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    open();
  };

  const confirmDelete = async () => {
    if (!selectedItem?.buildingId) return;

    try {
      await api.delete(`/admin/buildings/${selectedItem.buildingId}`);
      notify({
        title: "Deleted!",
        message: "Building deleted successfully.",
        success: true,
      });
      close();
      load();
    } catch (error) {
      notify({
        title: "Error!",
        message: "Unable to delete building.",
        success: false,
        error: true,
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ buildingName: "", buildingNumber: "", locationId: "" });
    navigate("/buildings");
  };

  const getLocationName = (id) => {
    const loc = locations.find((x) => x.locationId === id);
    return loc ? loc.locationName : id;
  };

  const columns = [
    { header: "Building ID", key: "buildingId", render: (val) => <strong>{val}</strong> },
    { header: "Building Name", key: "buildingName" },
    { header: "Location", key: "locationId", render: (val) => getLocationName(val) },
    { header: "Floors", key: "floors", render: (val) => val?.length || 0 },
    { header: "Actions", key: "actions", render: (_, b) => (
      <Group gap="xs" justify="center" wrap="nowrap">
        <Tooltip label="Edit Building">
          <ActionIcon variant="light" color="yellow" size="sm" onClick={() => handleEdit(b)}>
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete Building">
          <ActionIcon variant="light" color="red" size="sm" onClick={() => openDeleteModal(b)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Go To Floors">
          <ActionIcon variant="light" color="blue" size="sm" onClick={() => navigate(`/floors?buildingId=${b.buildingId}`)}>
            <IconArrowRight size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    )}
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Building Management</h2>
        {!isCreateMode ? (
          <Button onClick={() => navigate("/buildings/create")}>
            <IconPlus size={18} style={{ marginRight: "5px" }} /> Create Building
          </Button>
        ) : (
          <Button onClick={() => navigate("/buildings")} variant="outline" leftSection={<IconArrowLeft size={18} />}>
            Back
          </Button>
        )}
      </div>

      {isCreateMode ? (
        <div className="form-card">
          <h3 style={{ marginBottom: "15px" }}>
            {editingId ? "Edit Building" : "Add New Building"}
          </h3>

          <form onSubmit={save}>
            <div className="form-grid">
              <div className="form-group">
                <label>Location</label>
                <Select
                  placeholder="Select Location"
                  data={locations.map((loc) => ({ value: loc.locationId, label: loc.locationName }))}
                  value={form.locationId}
                  onChange={(val) => setForm({ ...form, locationId: val })}
                  disabled={!!editingId}
                  searchable
                  required
                />
              </div>

              <div className="form-group">
                <label>Building Name</label>
                <TextInput
                  placeholder="Enter Building Name"
                  value={form.buildingName}
                  onChange={(e) => setForm({ ...form, buildingName: e.target.value })}
                  required
                />
              </div>
            </div>

            <Group justify="center" mt="xl">
              <Button type="submit">
                {editingId ? "Update Building" : "Save Building"}
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
          title="All Buildings"
          columns={columns}
          data={items}
          loading={loading}
          search={search}
          onSearch={setSearch}
          totalCount={totalCount}
          page={page}
          totalPages={Math.ceil(totalCount / pageSize)}
          onPageChange={setPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal opened={opened} onClose={close} title="Delete Building" styles={{
        title: {
          fontSize: "18px",
          fontWeight: 600,
          color: "#e03131", // red color
        },
      }} centered>
        <Text size="sm">
          Are you sure you want to delete building <strong>{selectedItem?.buildingName}</strong>? This action cannot be undone.
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="gray" onClick={close}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default Buildings;