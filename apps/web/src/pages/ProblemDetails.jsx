import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Database,
  Gauge,
  Play,
  Sparkles,
  Zap
} from "lucide-react";
import CodeEditor from "../components/editor/CodeEditor.jsx";
import { problems } from "../data/mockData.js";

export default function ProblemDetails() {
  const { problemId } = useParams();
  const problem = useMemo(
    () => problems.find((item) => item.id === problemId) ?? problems[0],
    [problemId]
  );

  return (
    <div className="problem-detail-page">
      <nav className="problem-crumbs" aria-label="Breadcrumb">
        <Link to="/problems">Problems</Link>
        <ChevronRight size={15} />
        <span>{problem.topic}</span>
        <ChevronRight size={15} />
        <strong>{problem.title}</strong>
      </nav>

      <section className="problem-statement">
        <div className="detail-title-row">
          <div>
            <span className={`difficulty difficulty-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
            <h1>{problem.title}</h1>
          </div>
          <span className="solved-pill">
            <CheckCircle2 size={16} />
            {problem.status}
          </span>
        </div>
        <div className="detail-meta">
          <span>
            <Database size={16} />
            {problem.topic}
          </span>
          <span>
            <Gauge size={16} />
            {problem.acceptance}% acceptance
          </span>
          <span>
            <Clock size={16} />
            2s limit
          </span>
          <span>{problem.points} pts</span>
        </div>
        <p>{problem.statement}</p>

        <h2>
          <Sparkles size={18} />
          Examples
        </h2>
        {problem.examples.map((example, index) => (
          <div className="example-box" key={`${example.input}-${index}`}>
            <div>
              <strong>Example {index + 1}</strong>
              <Copy size={15} />
            </div>
            <pre>{`Input: ${example.input}\nOutput: ${example.output}`}</pre>
          </div>
        ))}

        <h2>
          <Bookmark size={18} />
          Constraints
        </h2>
        <ul className="constraint-list">
          {problem.constraints.map((constraint) => (
            <li key={constraint}>{constraint}</li>
          ))}
        </ul>
      </section>

      <section className="coding-workspace">
        <CodeEditor />

        <div className="testcase-panel">
          <div className="testcase-tabs">
            <button className="active">Testcase</button>
            <button>Custom Input</button>
            <button>Run Code Result</button>
            <div className="testcase-actions">
              <button className="button button-secondary">
                <Play size={16} />
                Run
              </button>
              <button className="button button-primary">
                <Zap size={16} />
                Submit
              </button>
            </div>
          </div>

          <div className="testcase-body">
            <aside className="case-list">
              {problem.examples.map((_, index) => (
                <button className={index === 0 ? "active" : ""} key={index}>
                  <CheckCircle2 size={16} />
                  Testcase {index + 1}
                </button>
              ))}
              <button className="add-case">+ Add Testcase</button>
            </aside>

            <div className="case-detail">
              <h3>Testcase 1</h3>
              <label>
                Input
                <span>{problem.examples[0]?.input}</span>
              </label>
              <label>
                Expected Output
                <span>{problem.examples[0]?.output}</span>
              </label>
              <label>
                Your Output
                <span className="accepted-text">{problem.examples[0]?.output}</span>
              </label>
            </div>

            <div className="result-summary">
              <div>
                <CheckCircle2 size={23} />
                <strong>Accepted</strong>
              </div>
              <span>Runtime <strong>32 ms</strong></span>
              <span>Memory <strong>14.2 MB</strong></span>
              <span>Beats <strong>92.31%</strong></span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
