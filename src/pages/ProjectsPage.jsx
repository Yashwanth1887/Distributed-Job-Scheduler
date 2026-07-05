import { useEffect, useState } from "react";
import api from "../services/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ organization_id: "", project_name: "", description: "" });

  const loadProjects = async () => {
    const res = await api.get("/projects");
    setProjects(res.data || []);
  };

  useEffect(() => { loadProjects().catch(() => {}); }, []);

  const createProject = async (e) => {
    e.preventDefault();
    await api.post("/projects", form);
    setForm({ organization_id: "", project_name: "", description: "" });
    loadProjects();
  };

  return (
    <div className="page-layout">
      <h1>Projects</h1>
      <div className="card">
        <h2>Create Project</h2>
        <form className="form-grid" onSubmit={createProject}>
          <input placeholder="Organization ID" value={form.organization_id} onChange={(e) => setForm({ ...form, organization_id: e.target.value })} />
          <input placeholder="Project Name" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="primary-btn">Create Project</button>
        </form>
      </div>
      <div className="card">
        <h2>Project List</h2>
        <table>
          <thead><tr><th>Project Name</th><th>Description</th><th>Created Date</th></tr></thead>
          <tbody>{projects.map((project) => <tr key={project.project_id}><td>{project.project_name}</td><td>{project.description || "-"}</td><td>{project.created_at}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
