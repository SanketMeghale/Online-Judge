import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Plus,
  Radio,
  Search,
  Swords,
  Trophy,
  Users,
  X,
  Medal,
  ChevronRight,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAppData } from "../data/AppDataContext.jsx";

const initialContests = [
  {
    id: "live-weekly-412",
    title: "Judgo Weekly Contest 412",
    type: "Weekly",
    category: "Algorithm",
    status: "LIVE",
    startTime: "Started 45 mins ago",
    remainingSeconds: 2700,
    duration: "1h 30m",
    participants: 5420,
    prize: "$500 Cash + Judgo Swag Box",
    sponsor: "Judgo Official",
    isRegistered: true,
    problems: [
      { id: "p1", name: "A. Minimum Moves to Equal Array", points: 250, diff: "Easy" },
      { id: "p2", name: "B. Count Valid Substrings", points: 500, diff: "Medium" },
      { id: "p3", name: "C. Maximum Flow in Bipartite Graph", points: 1000, diff: "Medium-Hard" },
      { id: "p4", name: "D. Dynamic Tree Re-Rooting", points: 1500, diff: "Hard" }
    ],
    rules: "4 Problems • Penalty of 5 minutes per wrong submission • Plagiarism detection active."
  },
  {
    id: "uber-tech-hiring-2026",
    title: "Uber Global Engineering Challenge 2026",
    type: "Hiring",
    category: "Company",
    status: "UPCOMING",
    startsIn: "1d 14h",
    startTimestamp: Date.now() + 86400000 + 51600000,
    duration: "2h 00m",
    participants: 9840,
    prize: "Direct L4/L5 Interview & $10k Pool",
    sponsor: "Uber",
    roles: "Backend & Distributed Systems",
    isRegistered: false,
    problems: [
      { id: "u1", name: "Real-time Driver Dispatch Routing", points: 400, diff: "Medium" },
      { id: "u2", name: "Low-latency Geospatial Index", points: 800, diff: "Hard" },
      { id: "u3", name: "Distributed Lock Rate Limiter", points: 1200, diff: "Hard" }
    ],
    rules: "Fast-track for top 50 participants • Algorithmic efficiency evaluated."
  },
  {
    id: "biweekly-134",
    title: "Judgo Biweekly Contest 134",
    type: "Biweekly",
    category: "Algorithm",
    status: "UPCOMING",
    startsIn: "3d 08h",
    startTimestamp: Date.now() + 86400000 * 3 + 31500000,
    duration: "1h 30m",
    participants: 3820,
    prize: "Knight Badge + 500 XP",
    sponsor: "Judgo Community",
    isRegistered: true,
    problems: [
      { id: "b1", name: "Array Prefix Optimization", points: 250, diff: "Easy" },
      { id: "b2", name: "Bitwise XOR Subsets", points: 500, diff: "Medium" },
      { id: "b3", name: "Shortest Path with K Teleports", points: 1000, diff: "Hard" }
    ],
    rules: "Rated for all participants • Standings update global rating."
  },
  {
    id: "meta-hacker-warmup",
    title: "Meta Hacker Cup 2026 Warmup",
    type: "Special",
    category: "Company",
    status: "UPCOMING",
    startsIn: "5d 18h",
    startTimestamp: Date.now() + 86400000 * 5 + 65400000,
    duration: "3h 00m",
    participants: 14200,
    prize: "Meta T-Shirt & Certificate",
    sponsor: "Meta",
    isRegistered: false,
    problems: [
      { id: "m1", name: "Valid String Expressions", points: 300, diff: "Easy" },
      { id: "m2", name: "Convex Hull Lattice Points", points: 700, diff: "Hard" },
      { id: "m3", name: "Optimal Matrix Partitioning", points: 1000, diff: "Hard" }
    ],
    rules: "Official Meta test harness supported."
  },
  {
    id: "monthly-sprint-mar",
    title: "Judgo Grand Monthly Masters 2026",
    type: "Monthly",
    category: "Algorithm",
    status: "UPCOMING",
    startsIn: "8d 12h",
    startTimestamp: Date.now() + 86400000 * 8,
    duration: "2h 30m",
    participants: 8150,
    prize: "$2,000 Grand Pool + Trophy",
    sponsor: "Google Cloud",
    isRegistered: false,
    problems: [
      { id: "g1", name: "Segment Tree Range Queries", points: 400, diff: "Medium" },
      { id: "g2", name: "Heavy-Light Decomposition", points: 1000, diff: "Hard" }
    ],
    rules: "Global Grandmaster Rating Match."
  },
  {
    id: "past-weekly-411",
    title: "Judgo Weekly Contest 411",
    type: "Weekly",
    category: "Algorithm",
    status: "PAST",
    endedAt: "3 days ago",
    duration: "1h 30m",
    participants: 6890,
    winner: "Tourist",
    topRank: "#1 Tourist • #2 Benq",
    myRank: "#412 (Top 6%)",
    myScore: "1750 pts",
    problems: [
      { id: "p411-1", name: "Find Peak Element II", points: 250, diff: "Medium" },
      { id: "p411-2", name: "Subarray Sums Divisible by K", points: 500, diff: "Medium" },
      { id: "p411-3", name: "Longest Increasing Path", points: 1000, diff: "Hard" }
    ]
  },
  {
    id: "past-amazon-hiring",
    title: "Amazon SDE Hiring Challenge 2026",
    type: "Hiring",
    category: "Company",
    status: "PAST",
    endedAt: "1 week ago",
    duration: "2h 00m",
    participants: 11200,
    winner: "Alex_CodeMaster",
    topRank: "#1 Alex • #2 Chen_Y",
    myRank: "#188 (Shortlisted)",
    myScore: "1900 pts",
    problems: [
      { id: "amz-1", name: "Warehouse Item Packing", points: 500, diff: "Medium" },
      { id: "amz-2", name: "K-Closest Delivery Hubs", points: 700, diff: "Medium" }
    ]
  }
];

const mockLeaderboard = [
  { rank: 1, handle: "Tourist", rating: 2840, badge: "Grandmaster", avatar: "👑" },
  { rank: 2, handle: "Benq", rating: 2790, badge: "Grandmaster", avatar: "⚡" },
  { rank: 3, handle: "Neal", rating: 2680, badge: "Master", avatar: "🔥" },
  { rank: 4, handle: "sanket.codes", rating: 1842, badge: "Knight", avatar: "🛡️", isUser: true },
  { rank: 5, handle: "ecnerwala", rating: 2610, badge: "Master", avatar: "🚀" }
];

export default function ContestPage() {
  const { user } = useAuth();
  const { getUserById } = useAppData();
  const [contests, setContests] = useState(initialContests);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContest, setSelectedContest] = useState(null);
  const [liveSeconds, setLiveSeconds] = useState(2700);

  const currentUserId = user?.id || user?._id || "";
  const liveUser = (currentUserId ? getUserById(currentUserId) : null) || user || {};
  const contestRating = liveUser?.ranking ? Math.max(1200, 1500 - liveUser.ranking * 8) : 1842;

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function formatTime(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function handleToggleRegistration(contestId) {
    setContests((prev) =>
      prev.map((c) => {
        if (c.id === contestId) {
          const nextState = !c.isRegistered;
          const nextCount = nextState ? c.participants + 1 : c.participants - 1;
          return { ...c, isRegistered: nextState, participants: nextCount };
        }
        return c;
      })
    );
  }

  const filteredContests = useMemo(() => {
    return contests.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sponsor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.type.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === "live") return c.status === "LIVE";
      if (activeTab === "upcoming") return c.status === "UPCOMING";
      if (activeTab === "hiring") return c.type === "Hiring" || c.category === "Company";
      if (activeTab === "past") return c.status === "PAST";
      return true;
    });
  }, [activeTab, contests, searchQuery]);

  const liveContest = contests.find((c) => c.status === "LIVE");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="contest-hub-page"
      style={{
        maxWidth: "1180px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        paddingBottom: "24px"
      }}
    >
      {/* 1. COMPACT HEADER (50–65px) WITH INTEGRATED RATING PILL */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "2px 0"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Swords size={16} style={{ color: "#a855f7" }} />
            <h1 style={{ fontSize: "1.45rem", fontWeight: "800", color: "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
              Contests & Arena
            </h1>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: "2px 0 0 0" }}>
            Compete in rated rounds, company hiring challenges, and speedrun battles.
          </p>
        </div>

        {/* Compact Rating Pill Widget */}
        <div
          style={{
            background: "#0d111a",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "6px",
              background: "rgba(124, 58, 237, 0.15)",
              border: "1px solid rgba(124, 58, 237, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.95rem"
            }}
          >
            🛡️
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Rating</span>
              <span style={{ fontSize: "0.65rem", background: "rgba(168, 85, 247, 0.15)", color: "#c084fc", padding: "1px 5px", borderRadius: "4px", fontWeight: "700" }}>Knight</span>
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#f8fafc", lineHeight: 1.1 }}>
              {contestRating} <small style={{ fontSize: "0.72rem", color: "#34d399", fontWeight: "600" }}>+48</small>
            </div>
          </div>
        </div>
      </header>

      {/* 2. COMPACT LIVE CONTEST CALLOUT (IF LIVE) */}
      {liveContest && (
        <section
          style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "10px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "#ef4444",
                color: "#ffffff",
                fontSize: "0.72rem",
                fontWeight: "800",
                padding: "2px 8px",
                borderRadius: "999px"
              }}
            >
              <Radio size={12} /> LIVE NOW
            </span>

            <strong style={{ fontSize: "0.92rem", color: "#f8fafc" }}>{liveContest.title}</strong>

            <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
              Ends in: <span style={{ fontFamily: "ui-monospace, monospace", color: "#fbbf24", fontWeight: "700" }}>{formatTime(liveSeconds)}</span>
            </span>

            <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
              • {liveContest.participants.toLocaleString()} competitors
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setSelectedContest(liveContest)}
              type="button"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                color: "#e2e8f0",
                padding: "5px 10px",
                fontSize: "0.76rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Problems & Rules
            </button>

            <Link
              to="/problems/two-sum"
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                border: "none",
                borderRadius: "6px",
                color: "#ffffff",
                padding: "5px 12px",
                fontSize: "0.78rem",
                fontWeight: "700",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <Play size={12} />
              <span>Join Arena</span>
            </Link>
          </div>
        </section>
      )}

      {/* 3. COMPACT TABS + SEARCH BAR */}
      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#080c14",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "8px",
            padding: "3px"
          }}
        >
          {[
            { id: "all", label: "All Contests" },
            { id: "live", label: "🔴 Live" },
            { id: "upcoming", label: "Upcoming" },
            { id: "hiring", label: "💼 Hiring" },
            { id: "past", label: "Past Archive" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                style={{
                  background: isActive ? "rgba(99, 102, 241, 0.2)" : "transparent",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 12px",
                  fontSize: "0.78rem",
                  fontWeight: isActive ? "700" : "500",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Compact Search Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#080c14",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "8px",
            padding: "0 10px",
            minWidth: "220px"
          }}
        >
          <Search size={14} style={{ color: "#64748b" }} />
          <input
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contests..."
            type="search"
            value={searchQuery}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#f8fafc",
              fontSize: "0.8rem",
              padding: "6px 8px",
              width: "100%"
            }}
          />
        </div>
      </section>

      {/* 4. MAIN 2-COLUMN GRID (CONTESTS LIST + RIGHT COMPACT LEADERBOARD) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: "14px",
          alignItems: "start"
        }}
      >
        {/* LEFT: CONTEST CARDS LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredContests.map((c) => {
            const isLive = c.status === "LIVE";
            const isUpcoming = c.status === "UPCOMING";
            const isPast = c.status === "PAST";

            return (
              <div
                key={c.id}
                style={{
                  background: "#0d111a",
                  border: isLive ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  transition: "border-color 0.15s ease"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: "240px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: "700",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        background: c.type === "Hiring" ? "rgba(245, 158, 11, 0.15)" : "rgba(99, 102, 241, 0.15)",
                        color: c.type === "Hiring" ? "#fbbf24" : "#818cf8",
                        border: c.type === "Hiring" ? "1px solid rgba(245, 158, 11, 0.25)" : "1px solid rgba(99, 102, 241, 0.25)"
                      }}
                    >
                      {c.type}
                    </span>
                    <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
                      by <strong style={{ color: "#94a3b8" }}>{c.sponsor}</strong>
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "0.98rem",
                      fontWeight: "700",
                      color: "#f8fafc",
                      margin: 0,
                      cursor: "pointer"
                    }}
                    onClick={() => setSelectedContest(c)}
                  >
                    {c.title}
                  </h3>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.75rem", color: "#94a3b8" }}>
                    {isUpcoming && <span><Clock size={12} style={{ display: "inline", marginRight: "3px" }} /> Starts in {c.startsIn}</span>}
                    {isLive && <span style={{ color: "#ef4444", fontWeight: "700" }}>Live Now</span>}
                    {isPast && <span><Calendar size={12} style={{ display: "inline", marginRight: "3px" }} /> Ended {c.endedAt}</span>}
                    <span><Users size={12} style={{ display: "inline", marginRight: "3px" }} /> {c.participants.toLocaleString()}</span>
                    <span><Award size={12} style={{ display: "inline", marginRight: "3px", color: "#fbbf24" }} /> {c.prize}</span>
                  </div>
                </div>

                {/* Right Action Button */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={() => setSelectedContest(c)}
                    type="button"
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "6px",
                      color: "#94a3b8",
                      padding: "6px 10px",
                      fontSize: "0.74rem",
                      fontWeight: "500",
                      cursor: "pointer"
                    }}
                  >
                    Details
                  </button>

                  {isUpcoming && (
                    <button
                      onClick={() => handleToggleRegistration(c.id)}
                      type="button"
                      style={{
                        background: c.isRegistered ? "rgba(16, 185, 129, 0.15)" : "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                        color: c.isRegistered ? "#34d399" : "#ffffff",
                        border: c.isRegistered ? "1px solid rgba(16, 185, 129, 0.3)" : "none",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontSize: "0.76rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      {c.isRegistered ? <CheckCircle2 size={13} /> : <Plus size={13} />}
                      <span>{c.isRegistered ? "Registered" : "Register"}</span>
                    </button>
                  )}

                  {isLive && (
                    <Link
                      to="/problems/two-sum"
                      style={{
                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        color: "#ffffff",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontSize: "0.76rem",
                        fontWeight: "700",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <Play size={12} />
                      <span>Enter Arena</span>
                    </Link>
                  )}

                  {isPast && (
                    <button
                      onClick={() => setSelectedContest(c)}
                      type="button"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#e2e8f0",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        fontSize: "0.74rem",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Upsolve
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!filteredContests.length && (
            <div
              style={{
                background: "#0d111a",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "24px",
                textAlign: "center",
                color: "#64748b",
                fontSize: "0.84rem"
              }}
            >
              No contests found matching your search.
            </div>
          )}
        </div>

        {/* RIGHT: COMPACT TOP CONTESTANTS & MILESTONES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Top Contestants Card */}
          <div
            style={{
              background: "#0d111a",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Trophy size={14} style={{ color: "#fbbf24" }} />
                <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#f8fafc" }}>Top Rated</span>
              </div>
              <Link to="/leaderboard" style={{ fontSize: "0.72rem", color: "#818cf8", textDecoration: "none", fontWeight: "600" }}>
                View all →
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {mockLeaderboard.map((item) => (
                <div
                  key={item.handle}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "5px 8px",
                    borderRadius: "6px",
                    background: item.isUser ? "rgba(99, 102, 241, 0.15)" : "#080c14",
                    border: item.isUser ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid rgba(255,255,255,0.04)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        color: item.rank === 1 ? "#fbbf24" : item.rank === 2 ? "#cbd5e1" : item.rank === 3 ? "#f97316" : "#64748b",
                        width: "14px"
                      }}
                    >
                      #{item.rank}
                    </span>
                    <span style={{ fontSize: "0.85rem" }}>{item.avatar}</span>
                    <strong style={{ fontSize: "0.78rem", color: item.isUser ? "#c084fc" : "#f8fafc" }}>
                      {item.handle}
                    </strong>
                  </div>
                  <span style={{ fontSize: "0.76rem", fontWeight: "700", color: "#34d399", fontFamily: "monospace" }}>
                    {item.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Milestones Card */}
          <div
            style={{
              background: "#0d111a",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Medal size={14} style={{ color: "#a855f7" }} />
              <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#f8fafc" }}>Badges & Perks</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              <div style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "1.1rem" }}>🎖️</span>
                <strong style={{ display: "block", fontSize: "0.74rem", color: "#f8fafc", marginTop: "2px" }}>Knight Badge</strong>
                <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Rating &gt; 1800</span>
              </div>
              <div style={{ background: "#080c14", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "1.1rem" }}>⚡</span>
                <strong style={{ display: "block", fontSize: "0.74rem", color: "#f8fafc", marginTop: "2px" }}>Speed Demon</strong>
                <span style={{ fontSize: "0.65rem", color: "#64748b" }}>AC in &lt; 5m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. COMPACT MODAL POPUP FOR DETAILS */}
      {selectedContest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px"
          }}
        >
          <div
            style={{
              background: "#0d111a",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "500px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 16px 40px rgba(0,0,0,0.6)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "0.7rem", background: "rgba(99, 102, 241, 0.15)", color: "#818cf8", padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
                  {selectedContest.type} Round
                </span>
                <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#f8fafc", margin: "4px 0 0" }}>
                  {selectedContest.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedContest(null)}
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: "2px"
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                background: "#080c14",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontSize: "0.78rem",
                color: "#cbd5e1"
              }}
            >
              <div>🏆 <strong>Prize:</strong> {selectedContest.prize}</div>
              <div>⏱️ <strong>Duration:</strong> {selectedContest.duration}</div>
              <div>👥 <strong>Participants:</strong> {selectedContest.participants.toLocaleString()}</div>
              <div>📜 <strong>Rules:</strong> {selectedContest.rules}</div>
            </div>

            <div>
              <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                Problem Set Overview ({selectedContest.problems?.length || 0} Problems)
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {(selectedContest.problems || []).map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "#080c14",
                      border: "1px solid rgba(255,255,255,0.04)",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      fontSize: "0.78rem"
                    }}
                  >
                    <span style={{ color: "#f8fafc", fontWeight: "500" }}>{p.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.72rem", color: p.diff === "Easy" ? "#34d399" : p.diff === "Medium" ? "#fbbf24" : "#f87171", fontWeight: "700" }}>
                        {p.diff}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#818cf8", fontWeight: "700" }}>
                        {p.points} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
              <button
                onClick={() => setSelectedContest(null)}
                type="button"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  borderRadius: "6px",
                  color: "#f8fafc",
                  padding: "7px 14px",
                  fontSize: "0.78rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
              <Link
                to="/problems/two-sum"
                onClick={() => setSelectedContest(null)}
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  color: "#ffffff",
                  borderRadius: "6px",
                  padding: "7px 16px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  textDecoration: "none"
                }}
              >
                Enter Arena
              </Link>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
