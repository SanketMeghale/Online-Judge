import { CheckCircle2, CircleDashed, Search, SlidersHorizontal, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { problems } from "../data/mockData.js";

const statusIcon = {
  Solved: CheckCircle2,
  Attempted: Timer,
  Unsolved: CircleDashed
};

export default function ProblemsList() {
  return (
    <div className="problems-page">
      <section className="page-header compact-header">
        <div>
          <span className="section-kicker">Problem archive</span>
          <h1>Choose a challenge</h1>
          <p>Focused practice list with compact filters and current progress.</p>
        </div>
        <div className="archive-search">
          <Search size={17} />
          <span>Search problems</span>
        </div>
      </section>

      <div className="filter-bar">
        <button className="button button-muted">
          <SlidersHorizontal size={17} />
          Difficulty
        </button>
        <button className="button button-muted">Arrays</button>
        <button className="button button-muted">Graphs</button>
        <button className="button button-muted">Dynamic Programming</button>
        <button className="button button-muted">Solved</button>
      </div>

      <section className="problem-list-panel">
        <div className="problem-list-head">
          <span>Problem</span>
          <span>Difficulty</span>
          <span>Topic</span>
          <span>Acceptance</span>
          <span>Status</span>
        </div>

        {problems.map((problem, index) => {
          const Icon = statusIcon[problem.status] ?? CircleDashed;

          return (
            <Link className="problem-row" key={problem.id} to={`/problems/${problem.id}`}>
              <span className="problem-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="problem-title-cell">
                <strong>{problem.title}</strong>
                <small>{problem.statement}</small>
              </span>
              <span className={`difficulty difficulty-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
              <span>{problem.topic}</span>
              <span>{problem.acceptance}%</span>
              <span className="problem-status">
                <Icon size={15} />
                {problem.status}
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
