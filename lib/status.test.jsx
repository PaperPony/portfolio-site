import { test } from "node:test";
import assert from "node:assert/strict";
import { getCurrentStatus } from "./status.jsx";

// Helper: build a Date for a given weekday + hour in local time.
// 2024-01-01 is a Monday, so dayOffset 0..6 maps Mon..Sun. We instead set an
// explicit date whose getDay() we assert, to avoid confusion.
function at(year, month, day, hour) {
  return new Date(year, month, day, hour, 0, 0, 0);
}

test("weekday mid-morning is heads-down coding", () => {
  // 2026-06-15 is a Monday.
  const d = at(2026, 5, 15, 10);
  assert.equal(d.getDay(), 1);
  const s = getCurrentStatus(d);
  assert.equal(s.label, "Deep in code");
  assert.equal(s.accent, "cobalt");
});

test("weekday early morning is off the clock", () => {
  const d = at(2026, 5, 15, 3); // Monday 3am
  assert.equal(getCurrentStatus(d).label, "Off the clock");
});

test("weekday afternoon hits a client call", () => {
  const d = at(2026, 5, 15, 14); // Monday 2pm
  assert.equal(getCurrentStatus(d).label, "In a client call");
});

test("weekend midday is tinkering", () => {
  // 2026-06-20 is a Saturday.
  const d = at(2026, 5, 20, 11);
  assert.equal(d.getDay(), 6);
  assert.equal(getCurrentStatus(d).label, "Tinkering");
});

test("boundaries are inclusive of `from`, exclusive of `to`", () => {
  // Weekday rule 9..12 -> "Deep in code"; 12..13 -> "Recharging".
  assert.equal(getCurrentStatus(at(2026, 5, 15, 9)).label, "Deep in code");
  assert.equal(getCurrentStatus(at(2026, 5, 15, 12)).label, "Recharging");
});

test("returns a well-formed status object", () => {
  const s = getCurrentStatus(at(2026, 5, 15, 10));
  assert.ok(typeof s.label === "string" && s.label.length > 0);
  assert.ok(typeof s.detail === "string");
  assert.ok(typeof s.accent === "string");
});
