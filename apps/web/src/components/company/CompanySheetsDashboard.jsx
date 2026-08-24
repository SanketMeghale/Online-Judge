import React, { useState, useEffect, useMemo } from "react";
import { Search, Building2, Sparkles, Filter, CheckCircle2, TrendingUp, Compass } from "lucide-react";
import { CompanyCard } from "./CompanyCard.jsx";
import { api } from "../../api/apiClient.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useAppData } from "../../data/AppDataContext.jsx";
import { calculateLocalCompanyList } from "../../data/appData.js";
import "../../styles/companySheets.css";

const CATEGORIES = [
  "All Companies",
  "Product Based",
  "Service Based",
  "FAANG",
  "Indian Product Companies",
  "Startups"
];

export function CompanySheetsDashboard({ onSelectCompany }) {
  const { user } = useAuth();
  const { database } = useAppData();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Companies");

  const currentUserId = user?.id || user?._id || "";

  // Load companies with user progress from backend API, with real local fallback
  useEffect(() => {
    let isMounted = true;

    async function fetchCompanies() {
      setLoading(true);
      try {
        const res = await api.getCompanies(currentUserId ? `userId=${currentUserId}` : "");
        if (isMounted && res && res.success && Array.isArray(res.companies)) {
          setCompanies(res.companies);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("[CompanySheets] Backend fetch notice, calculating locally:", err.message);
      }

      // Local fallback with real database submissions
      if (isMounted) {
        const localList = calculateLocalCompanyList(database, currentUserId);
        setCompanies(localList);
        setLoading(false);
      }
    }

    fetchCompanies();
    return () => {
      isMounted = false;
    };
  }, [currentUserId, database]);

  // Filtered companies based on search and category tab
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.frequentTopics || []).some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat =
        activeCategory === "All Companies" ||
        c.category === activeCategory ||
        (activeCategory === "FAANG" && (c.category === "FAANG" || c.tier?.includes("FAANG"))) ||
        (activeCategory === "Startups" && (c.category === "Startups" || c.tier?.includes("Unicorn")));

      return matchesSearch && matchesCat;
    });
  }, [companies, searchTerm, activeCategory]);

  // Summary Metrics
  const totalAvailableProblems = useMemo(() => {
    return companies.reduce((acc, c) => acc + (c.totalProblems || 0), 0);
  }, [companies]);

  const totalUserSolved = useMemo(() => {
    return companies.reduce((acc, c) => acc + (c.solvedCount || 0), 0);
  }, [companies]);

  return (
    <div className="company-sheets-container" data-lenis-prevent="true">
      {/* 1. HERO HEADER */}
      <div className="company-sheets-hero">
        <div className="company-hero-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Building2 size={16} color="#a855f7" />
            <h1 style={{ margin: 0 }}>Company Interview Sheets</h1>
            <span
              style={{
                fontSize: "0.60rem",
                background: "rgba(124, 58, 237, 0.18)",
                color: "#c084fc",
                border: "1px solid rgba(124, 58, 237, 0.3)",
                padding: "1px 6px",
                borderRadius: "999px",
                fontWeight: "700"
              }}
            >
              18+ TOP TECH SHEETS
            </span>
          </div>
          <p>
            Prepare smarter with company-specific DSA patterns, curated interview topics, and personalized readiness tracking.
          </p>
        </div>

        {/* 2. SEARCH & FILTER CONTROLS */}
        <div className="company-controls-row">
          <div className="company-search-box">
            <Search size={13} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search companies, topics, or roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="company-category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`company-cat-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. COMPANIES GRID */}
      {loading ? (
        <div className="company-card-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="company-card"
              style={{ minHeight: "220px", background: "rgba(255, 255, 255, 0.02)" }}
            >
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.05)"
                  }}
                />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ width: "60%", height: "14px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "4px" }} />
                  <div style={{ width: "35%", height: "10px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "4px" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div className="company-card-grid">
          {filteredCompanies.map((comp) => (
            <CompanyCard
              key={comp.id || comp.slug}
              company={comp}
              onViewSheet={onSelectCompany}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            background: "rgba(30, 41, 59, 0.3)",
            borderRadius: "14px",
            border: "1px dashed rgba(255, 255, 255, 0.1)"
          }}
        >
          <Building2 size={36} color="#64748b" style={{ margin: "0 auto 12px auto" }} />
          <h3 style={{ margin: "0 0 6px 0", color: "#f8fafc" }}>No matching company sheets found</h3>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.88rem" }}>
            Try searching for another company name, difficulty, or clear your category filter.
          </p>
        </div>
      )}
    </div>
  );
}

export default CompanySheetsDashboard;
