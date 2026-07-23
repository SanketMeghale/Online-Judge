import { useMemo, useState } from "react";
import { CheckCircle2, CircleDashed, Search, SlidersHorizontal, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

const statusIcon = {
  Solved: CheckCircle2,
  Attempted: Timer,
  Unsolved: CircleDashed
};

const difficultyFilters = ["All", "Easy", "Medium", "Hard"];

export default function ProblemsList() {
  const { user } = useAuth();
  const { getProblemsForUser } = useAppData();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [topic, setTopic] = useState("All");
  const problems = getProblemsForUser(user.id);
  const topics = useMemo(
    () => ["All", ...new Set(problems.map((problem) => problem.topic))],
    [problems]
  );

  const filteredProblems = useMemo(
    () =>
      problems.filter((problem) => {
        const matchesQuery =
          !query ||
          problem.title.toLowerCase().includes(query.toLowerCase()) ||
          problem.statement.toLowerCase().includes(query.toLowerCase());
        const matchesDifficulty = difficulty === "All" || problem.difficulty === difficulty;
        const matchesTopic = topic === "All" || problem.topic === topic;
        return matchesQuery && matchesDifficulty && matchesTopic;
      }),
    [difficulty, problems, query, topic]
  );

  return (
    <div className="problems-page">
      <section className="page-header compact-header">
        <div>
          <span className="section-kicker">Problem archive</span>
          <h1>Choose a challenge</h1>
          <p>{filteredProblems.length} problems ready to solve in this local workspace.</p>
        </div>
        <label className="archive-search">
          <Search size={17} />
          <input
            aria-label="Search problems"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search problems"
            type="search"
            value={query}
          />
        </label>
      </section>

      <div className="filter-bar">
        <span className="button button-muted">
          <SlidersHorizontal size={17} />
          Filters
        </span>
        {difficultyFilters.map((item) => (
          <button
            className={`button ${difficulty === item ? "button-primary" : "button-muted"}`}
            key={item}
            onClick={() => setDifficulty(item)}
            type="button"
          >
            {item}
          </button>
        ))}
        <select className="button button-muted topic-select" onChange={(event) => setTopic(event.target.value)} value={topic}>
          {topics.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <section className="problem-list-panel">
        <div className="problem-list-head">
          <span>Problem</span>
          <span>Difficulty</span>
          <span>Topic</span>
          <span>Acceptance</span>
          <span>Status</span>
        </div>

        {filteredProblems.map((problem, index) => {
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

        {!filteredProblems.length ? (
          <div className="empty-state">
            <strong>No problems matched your filters.</strong>
            <span>Try clearing the search or switching topics.</span>
          </div>
        ) : null}
      </section>
    </div>
  );
}
