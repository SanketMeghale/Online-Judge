import React from "react";
import { Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { CompanyLogo } from "./CompanyLogos.jsx";

// Meaningful geometric/symbolic prefixes for common algorithmic topics
function getTopicPrefix(topicName = "") {
  const t = String(topicName || "").toLowerCase();
  if (t.includes("dynamic") || t.includes("dp")) return "◈";
  if (t.includes("graph")) return "◇";
  if (t.includes("tree") || t.includes("trie")) return "△";
  if (t.includes("array") || t.includes("matrix")) return "▢";
  if (t.includes("string")) return "∿";
  if (t.includes("search") || t.includes("binary")) return "⌕";
  if (t.includes("window") || t.includes("pointer")) return "◫";
  if (t.includes("heap") || t.includes("queue") || t.includes("stack")) return "▤";
  return "•";
}

export function CompanyCard({ company, onViewSheet }) {
  const {
    name,
    category,
    tier,
    difficulty,
    totalProblems = 0,
    solvedCount = 0,
    completionPercentage = 0,
    frequentTopics = [],
    id,
    slug
  } = company;

  const isCompleted = totalProblems > 0 && solvedCount >= totalProblems;
  const diffClass = (difficulty || "Medium").toLowerCase().replace(/\s+/g, "-");
  const displayCategory = category || tier || "Company Sheet";

  return (
    <div
      className="company-card"
      onClick={() => onViewSheet(id || slug)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onViewSheet(id || slug);
        }
      }}
    >
      {/* 1. TOP HEADER: [LOGO] Company Name / Category & Difficulty Badge */}
      <div className="company-card-top">
        <div className="company-card-brand">
          <div className="company-card-logo-wrap">
            <CompanyLogo name={name} size={24} />
          </div>
          <div className="company-card-title-wrap">
            <h3 className="company-name">{name}</h3>
            <span className="company-card-category">{displayCategory}</span>
          </div>
        </div>

        <div className={`company-diff-badge ${diffClass}`}>
          <Zap size={11} className="diff-icon" />
          <span>{difficulty || "Medium"}</span>
        </div>
      </div>

      {/* 2. PROGRESS SECTION: Solved count + Percentage + Thin 4px Bar */}
      <div className="company-card-progress">
        <div className="company-progress-stats">
          <div className="solved-stat-group">
            <CheckCircle2
              size={13}
              className={`check-icon ${isCompleted ? "completed" : ""}`}
            />
            <span className="solved-text">
              {solvedCount} / {totalProblems} solved
            </span>
            {isCompleted && <span className="completed-badge">Completed</span>}
          </div>
          <span className={`percent-text ${isCompleted ? "completed" : ""}`}>
            {completionPercentage}%
          </span>
        </div>

        <div className="company-progress-bar-bg">
          <div
            className={`company-progress-bar-fill ${isCompleted ? "completed" : ""}`}
            style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
          />
        </div>
      </div>

      {/* 3. FOOTER: Topic Chips + View Sheet -> Action */}
      <div className="company-card-footer">
        <div className="company-card-topics">
          {frequentTopics && frequentTopics.slice(0, 2).map((topic, i) => (
            <span key={i} className="company-topic-pill">
              <span className="topic-prefix">{getTopicPrefix(topic)}</span>
              <span>{topic}</span>
            </span>
          ))}
          {frequentTopics && frequentTopics.length > 2 && (
            <span className="company-topic-pill topic-more">
              +{frequentTopics.length - 2}
            </span>
          )}
        </div>

        <div
          className="company-view-action"
          onClick={(e) => {
            e.stopPropagation();
            onViewSheet(id || slug);
          }}
        >
          <span>View Sheet</span>
          <ArrowRight size={13} className="view-arrow" />
        </div>
      </div>
    </div>
  );
}
