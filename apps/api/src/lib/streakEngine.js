/**
 * Judgo High-Precision Streak & Activity Engine
 * Accurately tracks consecutive active days, longest personal best streak, and calendar activity.
 */

export function formatDateKey(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key) {
  if (!key || typeof key !== "string") return null;
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 12, 0, 0); // Use noon to avoid timezone daylight boundary shifts
}

/**
 * Calculates current streak, best streak, and sorted active dates from a list of submissions or timestamps
 * @param {Array<Object|string>} submissionsOrDates - List of submission documents or date strings/timestamps
 * @param {Date} [referenceDate=new Date()] - Reference date (defaults to now)
 * @returns {{ currentStreak: number, bestStreak: number, activeDates: string[], lastActiveDate: string|null, isActiveToday: boolean }}
 */
export function calculateUserStreak(submissionsOrDates = [], referenceDate = new Date()) {
  const activeDateSet = new Set();

  for (const item of submissionsOrDates) {
    if (!item) continue;
    let rawDate = null;
    if (typeof item === "string" || typeof item === "number" || item instanceof Date) {
      rawDate = item;
    } else if (typeof item === "object") {
      // If it's a submission object, verify it has a valid verdict/timestamp
      const isAccepted = item.verdict === "AC" || item.verdict === "OK" || item.verdict === "Accepted" || !item.verdict;
      if (isAccepted) {
        rawDate = item.submittedAt || item.createdAt || item.date || item.completedAt;
      }
    }

    if (rawDate) {
      const k = formatDateKey(rawDate);
      if (k) activeDateSet.add(k);
    }
  }

  const sortedDates = Array.from(activeDateSet).sort();

  if (sortedDates.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      activeDates: [],
      lastActiveDate: null,
      isActiveToday: false
    };
  }

  // 1. Calculate historical best streak
  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (const dStr of sortedDates) {
    const curDate = parseDateKey(dStr);
    if (!curDate) continue;

    if (prevDate) {
      const diffMs = curDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (24 * 3600 * 1000));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }

    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
    prevDate = curDate;
  }

  // 2. Calculate current active streak ending today or yesterday
  const now = new Date(referenceDate);
  const todayKey = formatDateKey(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  const isActiveToday = activeDateSet.has(todayKey);
  const isActiveYesterday = activeDateSet.has(yesterdayKey);

  let currentStreak = 0;

  if (isActiveToday || isActiveYesterday) {
    const startRunner = isActiveToday ? new Date(now) : new Date(yesterday);
    startRunner.setHours(12, 0, 0, 0);

    while (activeDateSet.has(formatDateKey(startRunner))) {
      currentStreak++;
      startRunner.setDate(startRunner.getDate() - 1);
    }
  }

  bestStreak = Math.max(bestStreak, currentStreak);

  return {
    currentStreak,
    bestStreak,
    activeDates: sortedDates,
    lastActiveDate: sortedDates[sortedDates.length - 1] || null,
    isActiveToday
  };
}
