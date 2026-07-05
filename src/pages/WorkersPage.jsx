import { useEffect, useState } from "react";
import api from "../services/api";

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [workerName, setWorkerName] = useState("");

  const loadWorkers = async () => setWorkers((await api.get("/workers")).data || []);
  useEffect(() => { loadWorkers().catch(() => {}); }, []);

  const registerWorker = async (e) => {
    e.preventDefault();
    await api.post("/workers", { worker_name: workerName });
    setWorkerName("");
    loadWorkers();
  };

  return (
    <div className="page-layout">
      <h1>Workers</h1>
      <div className="card">
        <h2>Register Worker</h2>
        <form className="form-grid" onSubmit={registerWorker}>
          <input placeholder="Worker Name" value={workerName} onChange={(e) => setWorkerName(e.target.value)} />
          <button className="primary-btn">Register Worker</button>
        </form>
      </div>
      <div className="card">
        <h2>Worker List</h2>
        <table>
          <thead><tr><th>Worker Name</th><th>Status</th><th>Heartbeat</th><th>Running Jobs</th></tr></thead>
          <tbody>{workers.map((worker) => <tr key={worker.worker_id}><td>{worker.worker_name}</td><td>{worker.status}</td><td>{worker.last_heartbeat || "-"}</td><td>{worker.running_jobs ?? 0}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
