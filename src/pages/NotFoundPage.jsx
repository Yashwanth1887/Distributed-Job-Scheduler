import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="card center-card">
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/dashboard">Go to Dashboard</Link>
    </div>
  );
}
