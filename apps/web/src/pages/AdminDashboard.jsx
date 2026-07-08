import { DatabaseZap, FilePlus2, ShieldAlert, UsersRound } from "lucide-react";

const adminCards = [
  { title: "Problems", value: "248", icon: FilePlus2, text: "Create, edit, and publish problem sets." },
  { title: "Users", value: "12.4k", icon: UsersRound, text: "Review learners, teams, and permissions." },
  { title: "Judge queue", value: "18", icon: DatabaseZap, text: "Monitor queued and running submissions." },
  { title: "Alerts", value: "3", icon: ShieldAlert, text: "Inspect system errors and failed containers." }
];

export default function AdminDashboard() {
  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="section-kicker">Admin</span>
          <h1>Control center.</h1>
          <p>Optional admin view for content, users, and judge health.</p>
        </div>
      </section>
      <section className="admin-grid">
        {adminCards.map(({ title, value, icon: Icon, text }) => (
          <article className="admin-card" key={title}>
            <Icon size={22} />
            <span>{title}</span>
            <strong>{value}</strong>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
