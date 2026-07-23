import { useEffect, useMemo, useState } from "react";
import { Bookmark, CheckCircle2, ChevronRight, Clock, Database, Gauge, Play, Zap } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import CodeEditor from "../components/editor/CodeEditor.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

export default function ProblemDetails() {
  const { problemId } = useParams();
  const { user } = useAuth();
  const { getProblemById, getProblemsForUser, getSavedCode, runSolution, saveCode, submitSolution } = useAppData();
  const problem = getProblemById(problemId);
  const userProblems = getProblemsForUser(user.id);
  const problemWithStatus = useMemo(
    () => userProblems.find((item) => item.id === problemId) ?? problem,
    [problem, problemId, userProblems]
  );
  const [language, setLanguage] = useState("Python");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [code, setCode] = useState(() => getSavedCode(problemId, "Python", problem?.starterCode?.Python ?? ""));

  useEffect(() => {
    if (!problemWithStatus) {
      return;
    }

    setCode(getSavedCode(problemWithStatus.id, language, problemWithStatus.starterCode?.[language] ?? ""));
    setResult(null);
  }, [language, problemId]);

  if (!problemWithStatus) {
    return (
      <section className="section-block">
        <h1>Problem not found</h1>
        <p>The requested problem does not exist in the local dataset.</p>
      </section>
    );
  }

  function handleCodeChange(nextCode) {
    setCode(nextCode);
    saveCode(problemWithStatus.id, language, nextCode);
  }

  function handleLanguageChange(nextLanguage) {
    setLanguage(nextLanguage);
    setCode(getSavedCode(problemWithStatus.id, nextLanguage, problemWithStatus.starterCode?.[nextLanguage] ?? ""));
  }

  async function handleRun() {
    setIsRunning(true);
    setError("");

    try {
      const nextResult = await runSolution({
        problemId: problemWithStatus.id,
        language,
        code
      });
      setResult(nextResult);
    } catch (runError) {
      setError(runError.message);
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError("");

    try {
      const nextResult = await submitSolution({
        userId: user.id,
        problemId: problemWithStatus.id,
        language,
        code
      });
      setResult(nextResult);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeExample = problemWithStatus.examples[0];

  return (
    <div className="problem-detail-page">
      <nav className="problem-crumbs" aria-label="Breadcrumb">
        <Link to="/problems">Problems</Link>
        <ChevronRight size={15} />
        <span>{problemWithStatus.topic}</span>
        <ChevronRight size={15} />
        <strong>{problemWithStatus.title}</strong>
      </nav>

      <section className="problem-statement">
        <div className="detail-title-row">
          <div>
            <span className={`difficulty difficulty-${problemWithStatus.difficulty.toLowerCase()}`}>
              {problemWithStatus.difficulty}
            </span>
            <h1>{problemWithStatus.title}</h1>
          </div>
          <span className="solved-pill">
            <CheckCircle2 size={16} />
            {problemWithStatus.status}
          </span>
        </div>
        <div className="detail-meta">
          <span>
            <Database size={16} />
            {problemWithStatus.topic}
          </span>
          <span>
            <Gauge size={16} />
            {problemWithStatus.acceptance}% acceptance
          </span>
          <span>
            <Clock size={16} />
            2s limit
          </span>
          <span>{problemWithStatus.points} pts</span>
        </div>
        <p>{problemWithStatus.statement}</p>

        <h2>
          <Bookmark size={18} />
          Examples
        </h2>
        {problemWithStatus.examples.map((example, index) => (
          <div className="example-box" key={`${example.input}-${index}`}>
            <div>
              <strong>Example {index + 1}</strong>
            </div>
            <pre>{`Input: ${example.input}\nOutput: ${example.output}`}</pre>
          </div>
        ))}

        <h2>
          <Bookmark size={18} />
          Constraints
        </h2>
        <ul className="constraint-list">
          {problemWithStatus.constraints.map((constraint) => (
            <li key={constraint}>{constraint}</li>
          ))}
        </ul>
      </section>

      <section className="coding-workspace">
        <CodeEditor
          code={code}
          language={language}
          onCodeChange={handleCodeChange}
          onLanguageChange={handleLanguageChange}
        />

        <div className="testcase-panel">
          <div className="testcase-tabs">
            <button className="active" type="button">Testcase</button>
            <button type="button">Custom Input</button>
            <button type="button">Run Code Result</button>
            <div className="testcase-actions">
              <button className="button button-secondary" onClick={handleRun} type="button">
                <Play size={16} />
                {isRunning ? "Running..." : "Run"}
              </button>
              <button className="button button-primary" onClick={handleSubmit} type="button">
                <Zap size={16} />
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>

          <div className="testcase-body">
            <aside className="case-list">
              {problemWithStatus.examples.map((_, index) => (
                <button className={index === 0 ? "active" : ""} key={index} type="button">
                  <CheckCircle2 size={16} />
                  Testcase {index + 1}
                </button>
              ))}
            </aside>

            <div className="case-detail">
              <h3>Visible testcase</h3>
              <label>
                Input
                <span>{activeExample?.input}</span>
              </label>
              <label>
                Expected Output
                <span>{result?.expectedOutput ?? activeExample?.output}</span>
              </label>
              <label>
                Your Output
                <span className={result?.verdict === "AC" ? "accepted-text" : ""}>
                  {result?.output ?? "Run your code to see output."}
                </span>
              </label>
            </div>

            <div className={`result-summary verdict-banner verdict-${(result?.verdict ?? "idle").toLowerCase()}`}>
              <div>
                <CheckCircle2 size={23} />
                <strong>{result?.statusText ?? result?.verdict ?? "Ready"}</strong>
              </div>
              <span>Runtime <strong>{result?.runtime ?? "-"}</strong></span>
              <span>Memory <strong>{result?.memory ?? "-"}</strong></span>
              <span>{result?.message ?? "Use Run or Submit to evaluate your solution."}</span>
            </div>
            {error ? <p className="form-error">{error}</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
