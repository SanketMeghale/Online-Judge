import SubmissionTable from "../components/tables/SubmissionTable.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

export default function SubmissionHistoryPage() {
  const { user } = useAuth();
  const { getSubmissionsForUser } = useAppData();
  const submissions = getSubmissionsForUser(user.id);

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="section-kicker">Submissions</span>
          <h1>Submission history</h1>
          <p>Every run that you submit is stored locally so you can review verdicts over time.</p>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading compact">
          <span className="section-kicker">History</span>
          <h2>Recent attempts</h2>
        </div>
        <SubmissionTable rows={submissions} />
      </section>
    </div>
  );
}
