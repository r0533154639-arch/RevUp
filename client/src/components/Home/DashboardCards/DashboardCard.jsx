import { Link } from "react-router-dom";

function DashboardCard({ title, description, icon, linkTo }) {
    return (
        <Link to={linkTo} className="dashboard-card">
            <span className="icon">{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
        </Link>
    );
}

export default DashboardCard;
