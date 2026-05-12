import React, { useEffect, useState } from "react";
import { Modal, Button, ActionIcon, Tooltip, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { IconPlus, IconSearch, IconEdit, IconTrash, IconArrowLeft, IconArrowRight, IconMapPin } from "@tabler/icons-react";
import api from "../../../api/Interceptor";
import indiaLocations from "./StatesAndDistricts.json";
import notify from "../../utils/Notification";
import useDebounce from "../../../common/useDebounce";
import DataTable from "../../common/DataTable";

const Locations = () => {
  const navigate = useNavigate();
  const locationPath = useLocation().pathname;
  const isCreateMode = locationPath === "/locations/create";

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    country: "India",
    state: "",
    city: "",
    locationName: "",
    locationNumber: "",
    address: "",
  });

  const debouncedSearch = useDebounce(search, 500);

  const states = Object.keys(indiaLocations);
  const cities = form.state ? indiaLocations[form.state] : [];

  // ================= LOAD =================
  const load = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/admin/locations/view?page=${page - 1}&pageSize=${pageSize}&searchTerm=${debouncedSearch}`);

      setItems(res.data?.response || []);
      setTotalCount(res.data?.count || 0);
    } catch (error) {
      notify({
        title: "Error!",
        message: "Failed to load locations.",
        success: false,
        error: true,
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, debouncedSearch, pageSize]);

  // ================= INPUT CHANGE =================
  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ================= SAVE =================
  const save = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/admin/locations/${editingId}`, form);
        notify({
          title: "Updated!",
          message: "Location updated successfully.",
          success: true,
        });
      } else {
        await api.post("/admin/locations", form);
        notify({
          title: "Success!",
          message: "Location created successfully.",
          success: true,
        });
      }

      setForm({
        country: "India",
        state: "",
        city: "",
        locationName: "",
        locationNumber: "",
        address: "",
      });
      setEditingId(null);
      load();
      navigate("/locations");
    } catch (error) {
      notify({
        title: "Error!",
        message: error.response?.data?.message || "Failed to save location.",
        success: false,
        error: true,
      });
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setForm({
      country: item.country || "India",
      state: item.state || "",
      city: item.city || "",
      locationName: item.locationName || "",
      locationNumber: item.locationNumber || "",
      address: item.address || "",
    });
    setEditingId(item.locationId);
    navigate("/locations/create");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      country: "India",
      state: "",
      city: "",
      locationName: "",
      locationNumber: "",
      address: "",
    });
    navigate("/locations");
  };

  // ================= DELETE =================
  const openDeleteModal = (location) => {
    setSelectedLocation(location);
    open();
  };

  const closeDeleteModal = () => {
    setSelectedLocation(null);
    close();
  };

  const confirmDelete = async () => {
    if (!selectedLocation?.locationId) return;

    try {
      await api.delete(`/admin/locations/${selectedLocation.locationId}`);

      notify({
        title: "Deleted!",
        message: "Location deleted successfully.",
        success: true,
        error: false,
      });

      closeDeleteModal();
      load();
    } catch (error) {
      notify({
        title: "Error!",
        message: "Unable to delete location.",
        success: false,
        error: true,
      });
    }
  };

  const columns = [
    { header: "Location ID", key: "locationId", render: (val) => <strong>{val || "-"}</strong> },
    { header: "Location Name", key: "locationName" },
    { header: "City", key: "city" },
    { header: "Address", key: "address" },
    { header: "Buildings", key: "buildings", render: (val) => val?.length || 0 },
    {
      header: "Actions", key: "actions", render: (_, item) => (
        <Group gap="xs" justify="center" wrap="nowrap">
          <Tooltip label="Edit Location">
            <ActionIcon variant="light" color="yellow" size="sm" onClick={() => handleEdit(item)}>
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Location">
            <ActionIcon variant="light" color="red" size="sm" onClick={() => openDeleteModal(item)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Go To Buildings">
            <ActionIcon variant="light" color="brand" size="sm" onClick={() => navigate(`/buildings?locationId=${item.locationId}`)}>
              <IconArrowRight size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <Group align="center" gap="xl" wrap="nowrap" style={{ overflowX: 'auto', overflowY: 'hidden', flex: 1, paddingBottom: '5px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <IconMapPin size={28} color="var(--gold)" />
            Location Infrastructure
          </h2>
        </Group>
        {!isCreateMode ? (
          <Button onClick={() => navigate("/locations/create")} leftSection={<IconPlus size={18} />} size="sm">
            Create Location
          </Button>
        ) : (
          <Button onClick={() => navigate("/locations")} variant="outline" leftSection={<IconArrowLeft size={18} />} size="sm">
            Back
          </Button>
        )}
      </div>

      {isCreateMode ? (
        <div className="form-card">
          <h3 style={{ marginBottom: "15px" }}>
            {editingId ? "Edit Location" : "Add New Location"}
          </h3>

          <form onSubmit={save}>
            <div className="form-grid">
              <div className="form-group">
                <label>Country</label>
                <input value="India" disabled />
              </div>

              <div className="form-group">
                <label>State</label>
                <select
                  value={form.state}
                  onChange={(e) => {
                    handleChange("state", e.target.value);
                    handleChange("city", "");
                  }}
                >
                  <option value="">Select State</option>

                  {states.map((state, index) => (
                    <option key={index} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>District / City</label>
                <select
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                >
                  <option value="">Select City</option>

                  {cities.map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Location Name</label>
                <input
                  placeholder="Enter Location Name"
                  value={form.locationName}
                  onChange={(e) =>
                    handleChange("locationName", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  placeholder="Full Address"
                  value={form.address}
                  onChange={(e) =>
                    handleChange("address", e.target.value)
                  }
                />
              </div>
            </div>

            <Group justify="center" mt="xl">
              <Button
                type="submit"
                disabled={
                  !form.state ||
                  !form.city ||
                  !form.locationName ||
                  !form.address
                }
              >
                {editingId ? "Update Location" : "Save Location"}
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
          title="All Locations"
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
      )}

      {/* Delete Modal */}
      <Modal
        opened={opened}
        onClose={closeDeleteModal}
        centered
        title="Delete Location"
        styles={{
          title: {
            fontSize: "18px",
            fontWeight: 600,
            color: "#e03131", // red color
          },
        }}
      >
        <p>
          Are you sure you want to delete{" "}
          <strong>{selectedLocation?.locationName}</strong>?
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "25px",
          }}
        >
          <Button variant="outline" color="gray" onClick={closeDeleteModal}>
            Cancel
          </Button>

          <Button color="red" onClick={confirmDelete}>
            Yes, Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Locations;