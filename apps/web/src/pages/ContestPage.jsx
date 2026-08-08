import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Award,
  BarChart2,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  ExternalLink,
  Filter,
  Flame,
  Globe,
  Layers,
  Medal,
  Play,
  Plus,
  Radio,
  Search,
  Share2,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap
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
    remainingSeconds: 2700, // 45 mins remaining
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
    startsIn: "1d 14h 20m",
    startTimestamp: Date.now() + 86400000 + 51600000,
    duration: "2h 00m",
    participants: 9840,
    prize: "Direct L4/L5 Interview Referral & $10,000 Pool",
    sponsor: "Uber",
    roles: "Backend & Distributed Systems Engineers ($160k - $240k)",
    isRegistered: false,
    problems: [
      { id: "u1", name: "Real-time Driver Dispatch Routing", points: 400, diff: "Medium" },
      { id: "u2", name: "Low-latency Geospatial Index", points: 800, diff: "Hard" },
      { id: "u3", name: "Distributed Lock Rate Limiter", points: 1200, diff: "Hard" }
    ],
    rules: "Hiring Fast-track for top 50 participants • System & Algorithmic efficiency evaluated."
  },
  {
    id: "biweekly-134",
    title: "Judgo Biweekly Contest 134",
    type: "Biweekly",
    category: "Algorithm",
    status: "UPCOMING",
    startsIn: "3d 08h 45m",
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
    rules: "Rated for all participants • Standings determine rating updates."
  },
  {
    id: "meta-hacker-warmup",
    title: "Meta Hacker Cup 2026 Warmup Round",
    type: "Special",
    category: "Company",
    status: "UPCOMING",
    startsIn: "5d 18h 10m",
    startTimestamp: Date.now() + 86400000 * 5 + 65400000,
    duration: "3h 00m",
    participants: 14200,
    prize: "Meta Hacker Cup T-Shirt & Certificate",
    sponsor: "Meta",
    isRegistered: false,
    problems: [
      { id: "m1", name: "Valid String Expressions", points: 300, diff: "Easy" },
      { id: "m2", name: "Convex Hull Lattice Points", points: 700, diff: "Hard" },
      { id: "m3", name: "Optimal Matrix Partitioning", points: 1000, diff: "Hard" }
    ],
    rules: "Official Meta test harness • Multi-file input format Supported."
  },
  {
    id: "monthly-sprint-mar",
    title: "Judgo Grand Monthly Masters 2026",
    type: "Monthly",
    category: "Algorithm",
    status: "UPCOMING",
    startsIn: "8d 12h 00m",
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
    rules: "Heavy penalty for late submissions • Global Grandmaster Rating Match."
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
    winner: "Tourist (Rating 2840)",
    topRank: "#1 Tourist • #2 Benq • #3 Neal",
    myRank: "#412 (Top 6%)",
    myScore: "1750 pts",
    problems: [
      { id: "p411-1", name: "Find Peak Element II", points: 250 },
      { id: "p411-2", name: "Subarray Sums Divisible by K", points: 500 },
      { id: "p411-3", name: "Longest Increasing Path", points: 1000 }
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
    topRank: "#1 Alex • #2 Chen_Y • #3 Sarah_K",
    myRank: "#188 (Shortlisted!)",
    myScore: "1900 pts",
    problems: [
      { id: "amz-1", name: "Amazon Warehouse Item Packing", points: 500 },
      { id: "amz-2", name: "K-Closest Delivery Hubs", points: 700 }
    ]
  }
];

const mockLeaderboard = [
  { rank: 1, name: "Gennady Korotkevich", handle: "Tourist", rating: 2840, badge: "Grandmaster", country: "BY", avatar: "👑" },
  { rank: 2, name: "Benjamin Qi", handle: "Benq", rating: 2790, badge: "Grandmaster", country: "US", avatar: "⚡" },
  { rank: 3, name: "Neal Wu", handle: "Neal", rating: 2680, badge: "Master", country: "US", avatar: "🔥" },
  { rank: 4, name: "Sanket Meghale", handle: "sanket.codes", rating: 1842, badge: "Knight", country: "IN", avatar: "🛡️", isUser: true },
  { rank: 5, name: "Lingyuan Yan", handle: "ecnerwala", rating: 2610, badge: "Master", country: "US", avatar: "🚀" }
];

export default function ContestPage() {
  const { user } = useAuth();
  const [contests, setContests] = useState(initialContests);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'live' | 'upcoming' | 'hiring' | 'past'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContest, setSelectedContest] = useState(null);
  const [liveSeconds, setLiveSeconds] = useState(2700);

  // Real-time ticking clock for live contest
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="contest-hub-page"
      style={{ color: "#eef3ff", maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}
    >
      {/* Top Banner Header */}
      <section className="page-header" style={{ background: "linear-gradient(135deg, #0e132c 0%, #17113a 50%, #0d122b 100%)", border: "1px solid rgba(120, 80, 255, 0.25)", borderRadius: "18px", padding: "28px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Trophy size={20} style={{ color: "#f59e0b" }} />
              <span style={{ fontSize: "0.82rem", fontWeight: "900", letterSpacing: "0.08em", color: "#a855f7", textTransform: "uppercase" }}>Judgo Competitive Arena</span>
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", margin: 0, color: "#fff", lineHeight: 1.1 }}>Contest Hub & Global Rating</h1>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginTop: "6px", maxWidth: "620px" }}>
              Compete in weekly algorithmic rounds, company hiring hackathons, and global speedrun battles to boost your rating and win prizes.
            </p>
          </div>

          {/* User Rating Card Widget */}
          <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "18px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #7850ff, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
              🛡️
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>Your Rating</span>
                <span style={{ fontSize: "0.75rem", background: "rgba(168, 85, 247, 0.2)", color: "#c084fc", border: "1px solid rgba(168, 85, 247, 0.4)", padding: "1px 6px", borderRadius: "6px", fontWeight: "bold" }}>Knight</span>
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#fff", lineHeight: 1.1 }}>
                1,842 <small style={{ fontSize: "0.8rem", color: "#4ade80" }}>+48 pts</small>
              </div>
              <span style={{ fontSize: "0.76rem", color: "#64748b" }}>Global Rank: #1,204 (Top 4.2%)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured LIVE Contest Card (If active) */}
      {liveContest && (
        <section style={{ background: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(147, 51, 234, 0.12) 100%)", border: "1px solid rgba(239, 68, 68, 0.35)", borderRadius: "16px", padding: "24px 28px", position: "relative", overflow: "hidden", boxShadow: "0 12px 36px rgba(239, 68, 68, 0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ef4444", color: "#fff", fontSize: "0.78rem", fontWeight: "900", padding: "3px 10px", borderRadius: "999px", boxShadow: "0 0 12px rgba(239,68,68,0.6)" }}>
                  <Radio size={14} className="animate-pulse" /> LIVE NOW
                </span>
                <span style={{ fontSize: "0.85rem", color: "#cbd5e1", fontWeight: "600" }}>Ends in:</span>
                <span style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: "bold", color: "#facc15", background: "rgba(0,0,0,0.4)", padding: "2px 10px", borderRadius: "6px", border: "1px solid rgba(250,204,21,0.3)" }}>
                  {formatTime(liveSeconds)}
                </span>
              </div>
              <h2 style={{ fontSize: "1.45rem", fontWeight: "800", color: "#fff", margin: 0 }}>{liveContest.title}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.86rem", color: "#94a3b8" }}>
                <span><Users size={15} style={{ display: "inline", marginRight: "4px" }} /> {liveContest.participants.toLocaleString()} Competitors</span>
                <span><Award size={15} style={{ display: "inline", marginRight: "4px", color: "#f59e0b" }} /> {liveContest.prize}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setSelectedContest(liveContest)}
                type="button"
                style={{ background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "10px", color: "#fff", padding: "10px 18px", fontSize: "0.88rem", fontWeight: "bold", cursor: "pointer" }}
              >
                View Rules & Problems
              </button>
              <Link
                to={`/problems/two-sum`}
                style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", border: "none", borderRadius: "10px", color: "#fff", padding: "10px 22px", fontSize: "0.88rem", fontWeight: "bold", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 6px 20px rgba(239,68,68,0.4)" }}
              >
                <Play size={16} /> Enter Contest Arena
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Filter Tabs & Search Bar */}
      <section style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
        <div style={{ display: "flex", background: "#0d1326", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", padding: "4px" }}>
          {[
            { id: "all", label: "All Contests" },
            { id: "live", label: "🔴 Live" },
            { id: "upcoming", label: "Upcoming" },
            { id: "hiring", label: "💼 Hiring Challenges" },
            { id: "past", label: "Past Archive" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              style={{
                background: activeTab === tab.id ? "linear-gradient(135deg, #7850ff 0%, #3b82f6 100%)" : "transparent",
                color: activeTab === tab.id ? "#ffffff" : "#94a3b8",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "0.86rem",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", background: "#0d1326", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", padding: "0 14px", minWidth: "260px" }}>
          <Search size={16} style={{ color: "#64748b" }} />
          <input
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contest, sponsor, hiring..."
            type="search"
            value={searchQuery}
            style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "0.88rem", padding: "10px 10px", width: "100%" }}
          />
        </div>
      </section>

      {/* Main Grid: Contest Cards (Left 2 Columns) & Leaderboard / Calendar (Right Column) */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: "24px" }}>
        
        {/* Contests List Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredContests.map((c) => {
            const isLive = c.status === "LIVE";
            const isUpcoming = c.status === "UPCOMING";
            const isPast = c.status === "PAST";

            return (
              <div
                key={c.id}
                style={{
                  background: "linear-gradient(145deg, rgba(13, 22, 55, 0.95), rgba(8, 15, 38, 0.95))",
                  border: isLive ? "1px solid rgba(239,68,68,0.5)" : "1px solid #1f2d59",
                  borderRadius: "14px",
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "280px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        fontSize: "0.74rem",
                        fontWeight: "800",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: c.type === "Hiring" ? "rgba(245, 158, 11, 0.15)" : "rgba(59, 130, 246, 0.15)",
                        color: c.type === "Hiring" ? "#f59e0b" : "#3b82f6",
                        border: c.type === "Hiring" ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(59, 130, 246, 0.3)"
                      }}
                    >
                      {c.type}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>• Sponsored by <strong style={{ color: "#cbd5e1" }}>{c.sponsor}</strong></span>
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#ffffff", margin: 0, cursor: "pointer" }} onClick={() => setSelectedContest(c)}>
                    {c.title}
                  </h3>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.82rem", color: "#94a3b8", marginTop: "4px" }}>
                    {isUpcoming && <span><Clock size={14} style={{ display: "inline", marginRight: "4px" }} /> Starts: <strong>{c.startsIn}</strong></span>}
                    {isLive && <span style={{ color: "#ef4444", fontWeight: "bold" }}><Radio size={14} style={{ display: "inline", marginRight: "4px" }} /> Live Now</span>}
                    {isPast && <span><Calendar size={14} style={{ display: "inline", marginRight: "4px" }} /> Ended {c.endedAt}</span>}
                    <span><Users size={14} style={{ display: "inline", marginRight: "4px" }} /> {c.participants.toLocaleString()} registered</span>
                  </div>

                  {c.roles && (
                    <div style={{ fontSize: "0.78rem", color: "#4ade80", background: "rgba(74, 222, 128, 0.1)", padding: "4px 10px", borderRadius: "6px", marginTop: "6px", width: "fit-content" }}>
                      💼 {c.roles}
                    </div>
                  )}
                </div>

                {/* Actions & Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {isUpcoming && (
                    <button
                      onClick={() => handleToggleRegistration(c.id)}
                      type="button"
                      style={{
                        background: c.isRegistered ? "rgba(34, 197, 94, 0.15)" : "linear-gradient(135deg, #7850ff 0%, #3b82f6 100%)",
                        color: c.isRegistered ? "#4ade80" : "#ffffff",
                        border: c.isRegistered ? "1px solid rgba(34, 197, 94, 0.4)" : "none",
                        borderRadius: "10px",
                        padding: "9px 18px",
                        fontSize: "0.85rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {c.isRegistered ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                      {c.isRegistered ? "Registered ✓" : "Register Now"}
                    </button>
                  )}

                  {isLive && (
                    <Link
                      to="/problems/two-sum"
                      style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "#fff", borderRadius: "10px", padding: "9px 18px", fontSize: "0.85rem", fontWeight: "bold", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <Play size={15} /> Join Arena
                    </Link>
                  )}

                  {isPast && (
                    <button
                      onClick={() => setSelectedContest(c)}
                      type="button"
                      style={{ background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#eee", borderRadius: "10px", padding: "9px 16px", fontSize: "0.85rem", fontWeight: "bold", cursor: "pointer" }}
                    >
                      Virtual Upsolve
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!filteredContests.length && (
            <div style={{ background: "#0d1326", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "40px", textAlign: "center", color: "#94a3b8" }}>
              <h3>No contests matched your filter criteria.</h3>
              <p style={{ fontSize: "0.88rem" }}>Try clearing search or selecting "All Contests".</p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Leaderboard & Contest Badges */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Global Grandmaster Leaderboard Card */}
          <div style={{ background: "linear-gradient(145deg, rgba(13, 22, 55, 0.95), rgba(8, 15, 38, 0.95))", border: "1px solid #1f2d59", borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Trophy size={18} style={{ color: "#f59e0b" }} /> Top Rated Contestants
              </h3>
              <Link to="/leaderboard" style={{ fontSize: "0.78rem", color: "#3b82f6", textDecoration: "none", fontWeight: "bold" }}>View All</Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {mockLeaderboard.map((item) => (
                <div
                  key={item.handle}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    background: item.isUser ? "rgba(120, 80, 255, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    border: item.isUser ? "1px solid rgba(120, 80, 255, 0.3)" : "1px solid transparent"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "900", color: item.rank === 1 ? "#f59e0b" : item.rank === 2 ? "#cbd5e1" : item.rank === 3 ? "#b45309" : "#64748b", width: "18px" }}>
                      #{item.rank}
                    </span>
                    <span style={{ fontSize: "1.1rem" }}>{item.avatar}</span>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong style={{ fontSize: "0.88rem", color: item.isUser ? "#c084fc" : "#ffffff" }}>{item.handle}</strong>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{item.badge}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.9rem", fontWeight: "900", color: "#4ade80", fontFamily: "monospace" }}>{item.rating}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements & Contest Perks */}
          <div style={{ background: "linear-gradient(145deg, rgba(13, 22, 55, 0.95), rgba(8, 15, 38, 0.95))", border: "1px solid #1f2d59", borderRadius: "16px", padding: "20px" }}>
            <h3 style={{ fontSize: "1.02rem", fontWeight: "800", color: "#fff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Medal size={18} style={{ color: "#a855f7" }} /> Contest Milestones
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "1.4rem" }}>🎖️</span>
                <strong style={{ display: "block", fontSize: "0.82rem", color: "#fff", marginTop: "4px" }}>Knight Badge</strong>
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Rating &gt; 1800</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "1.4rem" }}>⚡</span>
                <strong style={{ display: "block", fontSize: "0.82rem", color: "#fff", marginTop: "4px" }}>Speed Demon</strong>
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>AC in &lt; 5 mins</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Contest Details Modal Popup */}
      {selectedContest && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#0f1629", border: "1px solid rgba(120, 80, 255, 0.3)", borderRadius: "18px", width: "100%", maxWidth: "620px", padding: "28px", display: "flex", flexDirection: "column", gap: "18px", boxShadow: "0 20px 50px rgba(0,0,0,0.8)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "0.76rem", background: "rgba(120, 80, 255, 0.2)", color: "#c084fc", padding: "2px 8px", borderRadius: "6px", fontWeight: "bold" }}>{selectedContest.type} Round</span>
                <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#fff", margin: "6px 0 0" }}>{selectedContest.title}</h2>
              </div>
              <button onClick={() => setSelectedContest(null)} type="button" style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "1.4rem", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.88rem" }}>
              <div>🏆 <strong>Prize Pool:</strong> {selectedContest.prize}</div>
              <div>⏱️ <strong>Duration:</strong> {selectedContest.duration}</div>
              <div>👥 <strong>Registered Participants:</strong> {selectedContest.participants.toLocaleString()}</div>
              <div>📜 <strong>Rules & Penalty:</strong> {selectedContest.rules}</div>
            </div>

            <div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#fff", marginBottom: "10px" }}>Problem Set Overview ({selectedContest.problems?.length || 0} Problems)</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(selectedContest.problems || []).map((p) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#090d18", border: "1px solid rgba(255,255,255,0.06)", padding: "10px 14px", borderRadius: "8px", fontSize: "0.88rem" }}>
                    <span style={{ color: "#eee", fontWeight: "600" }}>{p.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "0.75rem", color: p.diff === "Easy" ? "#4ade80" : p.diff === "Medium" ? "#facc15" : "#f43f5e", fontWeight: "bold" }}>{p.diff || "Medium"}</span>
                      <span style={{ fontSize: "0.82rem", color: "#a855f7", fontWeight: "bold" }}>{p.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
              <button onClick={() => setSelectedContest(null)} type="button" style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "8px", color: "#fff", padding: "10px 18px", fontWeight: "bold", cursor: "pointer" }}>Close</button>
              <Link to="/problems/two-sum" onClick={() => setSelectedContest(null)} style={{ background: "linear-gradient(135deg, #7850ff 0%, #3b82f6 100%)", color: "#fff", borderRadius: "8px", padding: "10px 22px", fontWeight: "bold", textDecoration: "none" }}>Enter Arena</Link>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
