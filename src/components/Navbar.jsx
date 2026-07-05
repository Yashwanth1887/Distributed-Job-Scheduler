import { Link } from "react-router-dom";

export default function Navbar({ onLogout }) {
  return (
    <div className="navbar">
      <div className="brand">Distributed Job Scheduler</div>
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/queues">Queues</Link>
        <Link to="/jobs">Jobs</Link>
        <Link to="/workers">Workers</Link>
        <Link to="/logs">Logs</Link>
        <button className="link-button" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
