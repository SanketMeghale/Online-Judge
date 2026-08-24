import React from "react";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import { CompanyLogo } from "./CompanyLogos.jsx";

export function CompanyCard({ company, onViewSheet }) {
  const {
    name,
    category,
    difficulty,
    totalProblems = 0,
    solvedCount = 0,
    completionPercentage = 0,
    frequentTopics = [],
    id,
    slug
  } = company;

  const diffClass = (difficulty || "Medium").toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="company-card" onClick={() => onViewSheet(id || slug)}>
      <div className="company-card-top">
        <div className="company-card-brand">
          <div className="company-card-logo-wrap">
            <CompanyLogo name={name} size={20} />
          </div>
          <div className="company-card-title-wrap">
            <h3>{name}</h3>
            <span className="company-card-category">{category}</span>
          </div>
        </div>
        <span className={`company-diff-badge ${diffClass}`}>
          {difficulty}
        </span>
      </div>

      {/* Dynamic Progress Indicator */}
      <div className="company-card-progress">
        <div className="company-progress-stats">
          <span className="solved-text">
            {solvedCount} / {totalProblems} Solved
          </span>
          <span className="percent-text">{completionPercentage}%</span>
        </div>
        <div className="company-progress-bar-bg">
          <div
            className="company-progress-bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
          />
        </div>
      </div>

      {/* Frequently Asked Topics & View Action Row */}
      <div className="company-card-footer">
        {frequentTopics && frequentTopics.length > 0 && (
          <div className="company-card-topics">
            {frequentTopics.slice(0, 3).map((topic, i) => (
              <span key={i} className="company-topic-pill">
                {topic}
              </span>
            ))}
            {frequentTopics.length > 3 && (
              <span className="company-topic-pill" style={{ opacity: 0.7 }}>
                +{frequentTopics.length - 3}
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          className="company-view-btn"
          onClick={(e) => {
            e.stopPropagation();
            onViewSheet(id || slug);
          }}
        >
          <span>View Sheet</span>
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}
