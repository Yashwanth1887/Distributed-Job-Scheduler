import { useEffect, useState } from "react";
import api from "../services/api";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [queues, setQueues] = useState([]);
  const [form, setForm] = useState({ queue_id: "", job_name: "", priority: 1, payload: "", status: "", scheduled_time: "", cron_expression: "", job_type: "Immediate Job", batch_jobs: "" });

  const loadJobs = async () => setJobs((await api.get("/jobs")).data || []);
  useEffect(() => { Promise.all([loadJobs(), api.get("/queues").then((res) => setQueues(res.data || []))]).catch(() => {}); }, []);

  const createJob = async (e) => {
    e.preventDefault();
    const payload = form.payload ? JSON.parse(form.payload) : null;
    if (form.job_type === "Batch Job") {
      const jobs = form.batch_jobs.split("\n").filter(Boolean).map((name) => ({ queue_id: form.queue_id, job_name: name, priority: form.priority, status: "QUEUED" }));
      await api.post("/jobs", { queue_id: form.queue_id, jobs, priority: form.priority });
    } else {
      await api.post("/jobs", {
        queue_id: form.queue_id,
        job_name: form.job_name,
        payload,
        priority: form.priority,
        status: form.status || undefined,
        scheduled_time: form.scheduled_time || undefined,
        cron_expression: form.cron_expression || undefined
      });
    }
    loadJobs();
  };

  return (
    <div className="page-layout">
      <h1>Jobs</h1>
      <div className="card">
        <h2>Create Job</h2>
        <form className="form-grid" onSubmit={createJob}>
          <select value={form.queue_id} onChange={(e) => setForm({ ...form, queue_id: e.target.value })}>
            <option value="">Select Queue</option>
            {queues.map((queue) => <option key={queue.queue_id} value={queue.queue_id}>{queue.queue_name}</option>)}
          </select>
          <input placeholder="Job Name" value={form.job_name} onChange={(e) => setForm({ ...form, job_name: e.target.value })} />
          <input placeholder="Priority" type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
          <select value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value })}>
            <option>Immediate Job</option><option>Delayed Job</option><option>Scheduled Job</option><option>Recurring Job</option><option>Batch Job</option>
          </select>
          <input placeholder='Payload JSON like {"a":1}' value={form.payload} onChange={(e) => setForm({ ...form, payload: e.target.value })} />
          <input placeholder="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
          <input placeholder="Scheduled Time" value={form.scheduled_time} onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })} />
          <input placeholder="Cron Expression" value={form.cron_expression} onChange={(e) => setForm({ ...form, cron_expression: e.target.value })} />
          <textarea placeholder="Batch Job Names, one per line" value={form.batch_jobs} onChange={(e) => setForm({ ...form, batch_jobs: e.target.value })} />
          <button className="primary-btn">Create Job</button>
        </form>
      </div>
      <div className="card">
        <h2>Job List</h2>
        <table>
          <thead><tr><th>Job Name</th><th>Queue</th><th>Priority</th><th>Status</th><th>Retry Count</th><th>Worker</th><th>Created Time</th></tr></thead>
          <tbody>{jobs.map((job) => <tr key={job.job_id}><td>{job.job_name}</td><td>{job.queue_name || job.queue_id}</td><td>{job.priority}</td><td>{job.status}</td><td>{job.retry_count ?? 0}</td><td>{job.worker_id || "-"}</td><td>{job.created_at}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
