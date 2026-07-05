import { useEffect, useState } from "react";
import api from "../services/api";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({});
  const [queues, setQueues] = useState([]);
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const [metricRes, queueRes, workerRes] = await Promise.all([
        api.get("/dashboard/system-metrics"),
        api.get("/dashboard/queue-health"),
        api.get("/dashboard/worker-status")
      ]);
      setMetrics(metricRes.data);
      setQueues(queueRes.data || []);
      setWorkers(workerRes.data || []);
    };
    loadDashboard().catch(() => {});
  }, []);

  const cards = [
    ["Total Queues", metrics.total_queues],
    ["Total Jobs", metrics.total_jobs],
    ["Running Jobs", metrics.running_jobs],
    ["Completed Jobs", metrics.completed_jobs],
    ["Failed Jobs", metrics.failed_jobs],
    ["Workers", metrics.total_workers]
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="card-grid">
        {cards.map(([label, value]) => (
          <div className="card stat-card" key={label}>
            <div>{label}</div>
            <strong>{value ?? 0}</strong>
          </div>
        ))}
      </div>
      <div className="two-col">
        <div className="card">
          <h2>Queue Health</h2>
          <table>
            <thead><tr><th>Queue</th><th>Status</th><th>Jobs</th></tr></thead>
            <tbody>{queues.map((q) => <tr key={q.queue_id}><td>{q.queue_name}</td><td>{q.status}</td><td>{q.total_jobs}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="card">
          <h2>Worker Status</h2>
          <table>
            <thead><tr><th>Worker</th><th>Status</th><th>Heartbeat</th></tr></thead>
            <tbody>{workers.map((w) => <tr key={w.worker_id}><td>{w.worker_name}</td><td>{w.status}</td><td>{w.last_heartbeat || "-"}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
