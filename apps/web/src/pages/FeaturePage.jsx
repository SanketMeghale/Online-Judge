import { Link } from "react-router-dom";

export default function FeaturePage({ title }) {
  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="section-kicker">Roadmap</span>
          <h1>{title}</h1>
          <p>This section is routed and ready, but the advanced feature set has not been implemented yet.</p>
        </div>
      </section>

      <section className="section-block feature-block">
        <h2>Current status</h2>
        <p>
          The core product now works end to end for auth, problems, solving, submissions, leaderboard,
          and profile tracking. This area is a clean placeholder for the next build phase.
        </p>
        <Link className="button button-primary" to="/problems">
          Return to problems
        </Link>
      </section>
    </div>
  );
}
