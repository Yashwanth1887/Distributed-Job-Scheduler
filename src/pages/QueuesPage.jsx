import { useEffect, useState } from "react";
import api from "../services/api";

export default function QueuesPage() {
  const [queues, setQueues] = useState([]);
  const [stats, setStats] = useState({});
  const [form, setForm] = useState({ project_id: "", retry_policy_id: "", queue_name: "", priority: 1, concurrency_limit: 1, status: "ACTIVE" });

  const loadQueues = async () => setQueues((await api.get("/queues")).data || []);
  useEffect(() => { loadQueues().catch(() => {}); }, []);

  const submitQueue = async (e) => {
    e.preventDefault();
    await api.post("/queues", form);
    setForm({ project_id: "", retry_policy_id: "", queue_name: "", priority: 1, concurrency_limit: 1, status: "ACTIVE" });
    loadQueues();
  };

  const handleAction = async (id, action) => {
    await api.put(`/queues/${id}/${action}`);
    loadQueues();
  };

  const loadStats = async (id) => {
    const res = await api.get(`/queues/${id}/statistics`);
    setStats((prev) => ({ ...prev, [id]: res.data }));
  };

  return (
    <div className="page-layout">
      <h1>Queues</h1>
      <div className="card">
        <h2>Create Queue</h2>
        <form className="form-grid" onSubmit={submitQueue}>
          <input placeholder="Project ID" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })} />
          <input placeholder="Retry Policy ID" value={form.retry_policy_id} onChange={(e) => setForm({ ...form, retry_policy_id: e.target.value })} />
          <input placeholder="Queue Name" value={form.queue_name} onChange={(e) => setForm({ ...form, queue_name: e.target.value })} />
          <input placeholder="Priority" type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
          <input placeholder="Concurrency" type="number" value={form.concurrency_limit} onChange={(e) => setForm({ ...form, concurrency_limit: Number(e.target.value) })} />
          <input placeholder="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
          <button className="primary-btn">Create Queue</button>
        </form>
      </div>
      <div className="card">
        <h2>Queue List</h2>
        <table>
          <thead><tr><th>Queue Name</th><th>Priority</th><th>Concurrency</th><th>Status</th><th>Retry Policy</th><th>Actions</th></tr></thead>
          <tbody>{queues.map((queue) => <tr key={queue.queue_id}><td>{queue.queue_name}</td><td>{queue.priority}</td><td>{queue.concurrency_limit}</td><td>{queue.status}</td><td>{queue.retry_policy_id}</td><td><button onClick={() => handleAction(queue.queue_id, "pause")}>Pause</button> <button onClick={() => handleAction(queue.queue_id, "resume")}>Resume</button> <button onClick={() => loadStats(queue.queue_id)}>Stats</button></td></tr>)}</tbody>
        </table>
      </div>
      {Object.entries(stats).map(([id, stat]) => <div className="card" key={id}><h2>Queue Statistics</h2><p>{stat.queue_name}</p><p>Total: {stat.total_jobs}, Queued: {stat.queued_jobs}, Running: {stat.running_jobs}, Completed: {stat.completed_jobs}, Failed: {stat.failed_jobs}</p></div>)}
    </div>
  );
}
