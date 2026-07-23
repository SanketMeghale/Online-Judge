import { DatabaseZap, FilePlus2, ShieldAlert, UsersRound } from "lucide-react";
import { useAppData } from "../data/AppDataContext.jsx";

export default function AdminDashboard() {
  const { database } = useAppData();
  const queuedLike = database.submissions.filter((submission) => submission.verdict !== "AC").length;
  const accepted = database.submissions.filter((submission) => submission.verdict === "AC").length;

  const adminCards = [
    { title: "Problems", value: String(database.problems.length), icon: FilePlus2, text: "Published coding problems in the local catalog." },
    { title: "Users", value: String(database.users.length), icon: UsersRound, text: "Registered accounts persisted in local storage." },
    { title: "Judge activity", value: String(database.submissions.length), icon: DatabaseZap, text: `${accepted} accepted submissions recorded so far.` },
    { title: "Needs review", value: String(queuedLike), icon: ShieldAlert, text: "Non-AC verdicts that may need debugging." }
  ];

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="section-kicker">Admin</span>
          <h1>Control center.</h1>
          <p>This local admin view summarizes the persisted app data and judge activity.</p>
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
