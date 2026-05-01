import React, { useState, useEffect } from "react";
import { IconClock } from "@tabler/icons-react";
import { Badge, Text, Group } from "@mantine/core";
import api from "../../api/Interceptor";
import notify from "../utils/Notification";
import DataTable from "../common/DataTable";
import useDebounce from "../../common/useDebounce";

const TenantLogs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const debouncedSearch = useDebounce(search, 500);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tenant-logs/view?page=${page - 1}&pageSize=${pageSize}&searchTerm=${debouncedSearch}`);
      setItems(res.data?.response || []);
      setTotalCount(res.data?.count || 0);
    } catch (err) {
      notify({ title: "Error", message: "Failed to load logs.", error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, debouncedSearch]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString();
  };

  const columns = [
    { header: "ID", key: "id", render: (val) => <Text size="xs" c="dimmed">#{val}</Text> },
    { header: "PG Number", key: "pgNumber", render: (val) => <strong>{val}</strong> },
    { header: "Out Time", key: "outTime", render: (val) => formatDate(val) },
    { header: "In Time", key: "inTime", render: (val) => formatDate(val) },
    { header: "Current Status", key: "status", render: (val) => (
      <Badge color={val === "IN" ? "green" : "red"}>
        {val}
      </Badge>
    )}
  ];

  return (
    <div>
      <div className="page-header">
        <Group gap="xs">
          <IconClock size={24} color="#3f92c5" />
          <h2 style={{ margin: 0 }}>In/Out Logs</h2>
        </Group>
      </div>

      <DataTable
        title="All Logs"
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
    </div>
  );
};

export default TenantLogs;
