import React, { useState, useEffect } from "react";
import { Modal, Button, Textarea, Select, Group, Badge, Text } from "@mantine/core";
import api from "../../api/Interceptor";
import notify from "../utils/Notification";
import DataTable from "../common/DataTable";
import useDebounce from "../../common/useDebounce";

import { IconAlertTriangle } from "@tabler/icons-react";

const Complaints = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const debouncedSearch = useDebounce(search, 500);

  const [form, setForm] = useState({ status: "OPEN", adminRemark: "" });

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/complaints/view?page=${page - 1}&pageSize=${pageSize}&searchTerm=${debouncedSearch}`);
      setItems(res.data?.response || []);
      setTotalCount(res.data?.count || 0);
    } catch (err) {
      notify({ title: "Error", message: "Failed to load complaints.", error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, debouncedSearch, pageSize]);

  const openModal = (c) => {
    setSelected(c);
    setForm({ status: c.status, adminRemark: c.adminRemark || "" });
    setModalOpen(true);
  };

  const save = async () => {
    try {
      await api.put(`/complaints/${selected.id}/status`, form);
      notify({ title: "Updated", message: "Complaint status updated.", success: true });
      setModalOpen(false);
      load();
    } catch (err) {
      notify({ title: "Error", message: "Failed to update status.", error: true });
    }
  };

  const statusColors = {
    RESOLVED: "green",
    OPEN: "red",
    IN_PROGRESS: "yellow"
  };

  const columns = [
    { header: "ID", key: "id", render: (val) => <Text size="xs" c="dimmed">#{val}</Text> },
    { header: "PG Number", key: "pgNumber", render: (val) => <strong>{val}</strong> },
    { header: "Issue", key: "issue", render: (val) => <div style={{ maxWidth: "300px", margin: "0 auto" }}>{val}</div> },
    { header: "Created At", key: "createdAt", render: (val) => <Text size="xs">{new Date(val).toLocaleDateString()}</Text> },
    {
      header: "Status",
      key: "status",
      render: (val) => <Badge color={statusColors[val]}>{val}</Badge>
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, c) => (
        <Group justify="center">
          <Button size="xs" variant="light" onClick={() => openModal(c)}>Update</Button>
        </Group>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <Group align="center" gap="sm">
          <IconAlertTriangle size={32} color="#fa5252" />
          <h2>Complaints Registry</h2>
        </Group>
      </div>

      <DataTable
        title="All Complaints"
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

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Update Complaint">
        {selected && (
          <div>
            <Text size="sm" mb="sm"><strong>Issue:</strong> {selected.issue}</Text>
            <Select
              label="Status"
              data={[
                { value: "OPEN", label: "Open" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "RESOLVED", label: "Resolved" }
              ]}
              value={form.status}
              onChange={val => setForm({ ...form, status: val })}
              mb="md"
            />
            <Textarea
              label="Admin Remark"
              value={form.adminRemark}
              onChange={e => setForm({ ...form, adminRemark: e.target.value })}
              placeholder="E.g., Plumber has been assigned."
              autosize minRows={3}
            />
            <Group justify="flex-end" mt="lg">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </Group>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Complaints;
