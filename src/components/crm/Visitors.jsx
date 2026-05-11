import React, { useState, useEffect } from "react";
import { Button, Group, Badge, Text } from "@mantine/core";
import api from "../../api/Interceptor";
import notify from "../utils/Notification";
import DataTable from "../common/DataTable";
import useDebounce from "../../common/useDebounce";

import { IconDoorEnter } from "@tabler/icons-react";

const Visitors = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const debouncedSearch = useDebounce(search, 500);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/visitors/view?page=${page - 1}&pageSize=${pageSize}&searchTerm=${debouncedSearch}`);
      setItems(res.data?.response || []);
      setTotalCount(res.data?.count || 0);
    } catch (err) {
      notify({ title: "Error", message: "Failed to load visitors.", error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, debouncedSearch, pageSize]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/visitors/${id}/status/${status}`);
      notify({ title: "Success", message: `Visitor ${status}`, success: true });
      load();
    } catch (err) {
      notify({ title: "Error", message: "Failed to update status.", error: true });
    }
  };

  const logTime = async (id, action) => {
    try {
      await api.put(`/visitors/${id}/${action}`);
      notify({ title: "Success", message: `Time logged successfully.`, success: true });
      load();
    } catch (err) {
      notify({ title: "Error", message: err.response?.data?.message || "Failed to log time.", error: true });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString();
  };

  const statusColors = {
    PENDING: "yellow",
    APPROVED: "green",
    REJECTED: "red"
  };

  const columns = [
    { header: "PG Number", key: "pgNumber", render: (val) => <strong>{val}</strong> },
    { header: "Visitor", key: "visitorName" },
    { header: "Phone", key: "phone", render: (val) => val || "—" },
    { header: "Purpose", key: "purpose" },
    { header: "Request Date", key: "requestDate", render: (val) => <Text size="xs">{formatDate(val)}</Text> },
    {
      header: "Status",
      key: "status",
      render: (val) => <Badge color={statusColors[val]}>{val}</Badge>
    },
    {
      header: "In / Out",
      key: "inTime",
      render: (_, v) => (
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="green">In: {formatDate(v.inTime)}</Text>
          <Text size="xs" c="red">Out: {formatDate(v.outTime)}</Text>
        </div>
      )
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, v) => (
        <Group gap="xs" justify="center">
          {v.status === "PENDING" && (
            <>
              <Button size="xs" color="green" onClick={() => updateStatus(v.id, "APPROVED")}>Approve</Button>
              <Button size="xs" color="red" onClick={() => updateStatus(v.id, "REJECTED")}>Reject</Button>
            </>
          )}
          {v.status === "APPROVED" && !v.inTime && (
            <Button size="xs" variant="outline" color="green" onClick={() => logTime(v.id, "in")}>Log Entry</Button>
          )}
          {v.status === "APPROVED" && v.inTime && !v.outTime && (
            <Button size="xs" variant="outline" color="red" onClick={() => logTime(v.id, "out")}>Log Exit</Button>
          )}
        </Group>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <Group gap="xs">
          <IconDoorEnter size={24} color="#c5a059" />
          <h2 style={{ margin: 0 }}>Visitor Management</h2>
        </Group>
      </div>

      <DataTable
        title="Visitor Requests"
        columns={columns}
        data={items}
        loading={loading}
        search={search}
        onSearch={(val) => { setSearch(val); setPage(1); }}
        totalCount={totalCount}
        page={page}
        totalPages={Math.ceil(totalCount / pageSize)}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};

export default Visitors;
