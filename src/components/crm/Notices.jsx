import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Textarea, Group, Badge, Text } from "@mantine/core";
import api from "../../api/Interceptor";
import notify from "../utils/Notification";
import DataTable from "../common/DataTable";
import useDebounce from "../../common/useDebounce";

import { IconSpeakerphone, IconPlus } from "@tabler/icons-react";

const Notices = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const debouncedSearch = useDebounce(search, 500);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/notices/view?page=${page - 1}&pageSize=${pageSize}&searchTerm=${debouncedSearch}`);
      setItems(res.data?.response || []);
      setTotalCount(res.data?.count || 0);
    } catch (err) {
      notify({ title: "Error", message: "Failed to load notices.", error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, debouncedSearch, pageSize]);

  const save = async () => {
    if (!form.title || !form.content) {
      notify({ title: "Validation Error", message: "Title and content are required.", error: true });
      return;
    }
    try {
      await api.post("/notices", form);
      notify({ title: "Success", message: "Notice broadcasted.", success: true });
      setModalOpen(false);
      setForm({ title: "", content: "" });
      load();
    } catch (err) {
      notify({ title: "Error", message: "Failed to save notice.", error: true });
    }
  };

  const toggle = async (id) => {
    try {
      await api.put(`/notices/${id}/toggle`);
      notify({ title: "Success", message: "Status updated.", success: true });
      load();
    } catch (err) {
      notify({ title: "Error", message: "Failed to update.", error: true });
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      notify({ title: "Deleted", message: "Notice removed.", success: true });
      load();
    } catch (err) {
      notify({ title: "Error", message: "Failed to delete.", error: true });
    }
  };

  const columns = [
    { header: "ID", key: "id", render: (val) => <Text size="xs" c="dimmed">#{val}</Text> },
    { header: "Title", key: "title", render: (val) => <strong>{val}</strong> },
    { header: "Message", key: "content", render: (val) => <div style={{ maxWidth: "300px", margin: "0 auto" }}>{val}</div> },
    { header: "Date", key: "createdAt", render: (val) => <Text size="xs">{new Date(val).toLocaleDateString()}</Text> },
    {
      header: "Status",
      key: "active",
      render: (val) => <Badge color={val ? "green" : "gray"}>{val ? "ACTIVE" : "INACTIVE"}</Badge>
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, n) => (
        <Group gap="xs" justify="center">
          <Button size="xs" variant="light" color={n.active ? "red" : "green"} onClick={() => toggle(n.id)}>
            {n.active ? "Deactivate" : "Activate"}
          </Button>
          <Button size="xs" variant="light" color="red" onClick={() => remove(n.id)}>Delete</Button>
        </Group>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <Group gap="xs">
          <IconSpeakerphone size={24} color="#3f92c5" />
          <h2 style={{ margin: 0 }}>Notice Board</h2>
        </Group>
        <Button onClick={() => setModalOpen(true)} leftSection={<IconPlus size={16} />}>
          Create Notice
        </Button>
      </div>

      <DataTable
        title="All Notices"
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

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Broadcast Notice">
        <TextInput
          label="Notice Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="E.g., Water Supply Disruption"
          required mb="sm"
        />
        <Textarea
          label="Content"
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
          placeholder="Enter details..."
          required autosize minRows={3}
        />
        <Group justify="flex-end" mt="lg">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={save}>Broadcast</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default Notices;
