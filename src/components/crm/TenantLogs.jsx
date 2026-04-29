import React, { useState, useEffect } from "react";
import { Badge, Text } from "@mantine/core";
import api from "../../api/Interceptor";
import notify from "../utils/Notification";

const TenantLogs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tenant-logs");
      setItems(res.data?.response || res.data?.data || []);
    } catch (err) {
      notify({ title: "Error", message: "Failed to load logs.", error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div>
      <div className="page-header">
        <h2>⏱️ In/Out Logs</h2>
      </div>

      <div className="data-card">
        <div className="data-card-header">
          <h3>All Logs ({items.length})</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>PG Number</th>
              <th>Out Time</th>
              <th>In Time</th>
              <th>Current Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(l => (
              <tr key={l.id}>
                <td><Text size="xs" c="dimmed">#{l.id}</Text></td>
                <td><strong>{l.pgNumber}</strong></td>
                <td>{formatDate(l.outTime)}</td>
                <td>{formatDate(l.inTime)}</td>
                <td>
                  <Badge color={l.status === "IN" ? "green" : "red"}>
                    {l.status}
                  </Badge>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: "center", padding: "30px" }}>{loading ? "Loading..." : "No logs found"}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TenantLogs;
