import { useEffect, useState } from "react";
import api from "../services/api";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/dashboard/execution-logs").then((res) => setLogs(res.data || [])).catch(() => {});
  }, []);

  return (
    <div className="page-layout">
      <h1>Logs</h1>
      <div className="card">
        <h2>Execution Logs</h2>
        <table>
          <thead><tr><th>Job Logs</th><th>Execution Time</th><th>Status</th><th>Worker</th></tr></thead>
          <tbody>{logs.map((log) => <tr key={log.execution_id || `${log.job_id}-${log.started_at}`}><td>{log.job_name}</td><td>{log.started_at || log.execution_time || "-"}</td><td>{log.status || log.execution_status || "-"}</td><td>{log.worker_name || "-"}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
