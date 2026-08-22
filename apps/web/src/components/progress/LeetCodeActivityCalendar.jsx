import { useState, useMemo } from "react";
import { Calendar, Flame, Trophy, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/leetcodeCalendar.css";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export default function LeetCodeActivityCalendar({
  submissions = [],
  activityGrid = [],
  activeDaysCount = 0,
  currentStreak = 0,
  maxStreak = 0,
  timeRange = "30d"
}) {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate 7-row x N-week LeetCode matrix
  const { weeks, monthLabels, totalSubmissionsInMatrix, activeDaysInMatrix } = useMemo(() => {
    // 1. Build a map of date string (YYYY-MM-DD) -> submission count
    const dateCountMap = new Map();
    const now = new Date();

    // Fill from raw submissions or activityGrid
    if (activityGrid && activityGrid.length > 0) {
      activityGrid.forEach((d) => {
        if (d.date) {
          dateCountMap.set(d.date, (dateCountMap.get(d.date) || 0) + (d.count || 0));
        }
      });
    }

    if (submissions && submissions.length > 0) {
      submissions.forEach((s) => {
        const dt = new Date(s.submittedAt || s.createdAt || 0);
        if (!isNaN(dt.getTime())) {
          const k = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
          dateCountMap.set(k, (dateCountMap.get(k) || 0) + 1);
        }
      });
    }

    // 2. Determine number of weeks based on screen space / time range (default 24-28 weeks)
    const numWeeks = 24; // 24 weeks ~ 5.5 months of rich matrix
    const totalDays = numWeeks * 7;

    // End at today's day of the week
    const currentDayOfWeek = now.getDay(); // 0 = Sun, 6 = Sat
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - (totalDays - (7 - currentDayOfWeek) - 1));

    const weeksList = [];
    const monthsList = [];
    let lastMonth = -1;
    let totalSubs = 0;
    let activeDays = 0;

    let cursor = new Date(startDate);

    for (let w = 0; w < numWeeks; w++) {
      const weekDays = [];
      let weekStartMonth = -1;

      for (let d = 0; d < 7; d++) {
        const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
        const isFuture = cursor > now;
        const count = isFuture ? 0 : dateCountMap.get(dateStr) || 0;

        if (count > 0) {
          totalSubs += count;
          activeDays += 1;
        }

        let intensity = 0;
        if (count >= 7) intensity = 4;
        else if (count >= 4) intensity = 3;
        else if (count >= 2) intensity = 2;
        else if (count >= 1) intensity = 1;

        if (d === 0) {
          weekStartMonth = cursor.getMonth();
        }

        weekDays.push({
          date: dateStr,
          dayOfWeek: d,
          dayOfMonth: cursor.getDate(),
          month: cursor.getMonth(),
          year: cursor.getFullYear(),
          formattedDate: cursor.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
          }),
          count,
          intensity,
          isFuture,
          isToday: cursor.toDateString() === now.toDateString()
        });

        cursor.setDate(cursor.getDate() + 1);
      }

      // Check if we should place a month label for this week column
      if (weekStartMonth !== -1 && weekStartMonth !== lastMonth) {
        monthsList.push({ weekIndex: w, label: MONTH_NAMES[weekStartMonth] });
        lastMonth = weekStartMonth;
      }

      weeksList.push(weekDays);
    }

    return {
      weeks: weeksList,
      monthLabels: monthsList,
      totalSubmissionsInMatrix: totalSubs,
      activeDaysInMatrix: activeDays
    };
  }, [submissions, activityGrid, timeRange]);

  return (
    <div className="lc-activity-card">
      {/* 1. Header Row */}
      <div className="lc-activity-header">
        <div className="lc-header-left">
          <Calendar size={15} className="lc-cal-icon" />
          <h3 className="lc-title">Coding Activity</h3>
          <span className="lc-active-pill">
            {activeDaysCount || activeDaysInMatrix} active days
          </span>
        </div>

        <div className="lc-header-stats">
          <span className="lc-stat-item" title="Current Active Streak">
            <Flame size={13} className="lc-stat-icon-flame" />
            <span>Streak: <strong>{currentStreak}d</strong></span>
          </span>
          <span className="lc-stat-divider">•</span>
          <span className="lc-stat-item" title="Max Recorded Streak">
            <Trophy size={13} className="lc-stat-icon-trophy" />
            <span>Max: <strong>{maxStreak}d</strong></span>
          </span>
        </div>
      </div>

      {/* 2. LeetCode 7-Row Calendar Matrix */}
      <div className="lc-matrix-wrapper">
        {/* Month Labels along the top */}
        <div className="lc-months-row">
          <div className="lc-day-col-spacer" />
          <div className="lc-months-track">
            {monthLabels.map((m) => (
              <span
                key={`${m.weekIndex}-${m.label}`}
                className="lc-month-label"
                style={{ left: `calc(${m.weekIndex} * 14.5px)` }}
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* Matrix Grid: Left Day Labels + Columns of Weeks */}
        <div className="lc-grid-body">
          {/* Day of Week Labels (Mon, Wed, Fri) */}
          <div className="lc-day-labels-col">
            {DAY_LABELS.map((lbl, idx) => (
              <div key={idx} className="lc-day-label">
                {lbl}
              </div>
            ))}
          </div>

          {/* Columns (Weeks) */}
          <div className="lc-weeks-container">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="lc-week-col">
                {week.map((day) => {
                  const isHovered = hoveredDay?.date === day.date;
                  return (
                    <div
                      key={day.date}
                      className={`lc-day-square intensity-${day.intensity} ${day.isToday ? "is-today" : ""} ${day.isFuture ? "is-future" : ""}`}
                      onMouseEnter={(e) => {
                        if (!day.isFuture) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredDay({
                            ...day,
                            x: rect.left + rect.width / 2,
                            y: rect.top
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Floating Tooltip */}
      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            className="lc-day-tooltip"
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{
              position: "fixed",
              left: `${hoveredDay.x}px`,
              top: `${hoveredDay.y - 36}px`,
              transform: "translateX(-50%)"
            }}
          >
            <strong>{hoveredDay.count} submission{hoveredDay.count === 1 ? "" : "s"}</strong> on {hoveredDay.formattedDate}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Footer & Legend */}
      <div className="lc-activity-footer">
        <span className="lc-footer-subtext">
          {totalSubmissionsInMatrix} submissions in active range
        </span>

        <div className="lc-legend-row">
          <span className="lc-legend-label">Less</span>
          <div className="lc-legend-squares">
            <span className="lc-day-square intensity-0" title="0 submissions" />
            <span className="lc-day-square intensity-1" title="1-2 submissions" />
            <span className="lc-day-square intensity-2" title="2-3 submissions" />
            <span className="lc-day-square intensity-3" title="4-6 submissions" />
            <span className="lc-day-square intensity-4" title="7+ submissions" />
          </div>
          <span className="lc-legend-label">More</span>
        </div>
      </div>
    </div>
  );
}
