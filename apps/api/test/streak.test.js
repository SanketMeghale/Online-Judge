import assert from "node:assert/strict";
import test from "node:test";
import { calculateUserStreak, formatDateKey } from "../src/lib/streakEngine.js";

test("accepted activity today starts a one-day streak", () => {
  const today = new Date(2026, 7, 22, 12, 0, 0);
  const result = calculateUserStreak([formatDateKey(today)], today);

  assert.equal(result.currentStreak, 1);
  assert.equal(result.bestStreak, 1);
  assert.equal(result.isActiveToday, true);
});

test("consecutive activity dates produce current and best streaks", () => {
  const reference = new Date(2026, 7, 22, 12, 0, 0);
  const result = calculateUserStreak([
    "2026-08-18",
    "2026-08-20",
    "2026-08-21",
    "2026-08-22",
    "2026-08-22"
  ], reference);

  assert.equal(result.currentStreak, 3);
  assert.equal(result.bestStreak, 3);
  assert.deepEqual(result.activeDates, ["2026-08-18", "2026-08-20", "2026-08-21", "2026-08-22"]);
});

test("a streak remains current through the day after the last activity", () => {
  const reference = new Date(2026, 7, 22, 12, 0, 0);
  const result = calculateUserStreak(["2026-08-20", "2026-08-21"], reference);

  assert.equal(result.currentStreak, 2);
  assert.equal(result.bestStreak, 2);
  assert.equal(result.isActiveToday, false);
});

test("an expired streak resets current count but keeps the historical best", () => {
  const reference = new Date(2026, 7, 22, 12, 0, 0);
  const result = calculateUserStreak(["2026-08-17", "2026-08-18", "2026-08-19"], reference);

  assert.equal(result.currentStreak, 0);
  assert.equal(result.bestStreak, 3);
});
