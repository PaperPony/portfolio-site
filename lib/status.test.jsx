import { test } from "node:test";
import assert from "node:assert/strict";
import { getCurrentStatus } from "./status.jsx";

// Helper: build a Date for a given calendar day + time in local time.
// Reference days used below (all in June 2026):
//   15 = Mon, 16 = Tue, 17 = Wed, 18 = Thu, 20 = Sat, 21 = Sun
function at(year, month, day, hour, minute = 0) {
  return new Date(year, month, day, hour, minute, 0, 0);
}

test("weekday mid-morning is heads-down coding", () => {
  const d = at(2026, 5, 16, 10); // Tuesday 10am
  assert.equal(d.getDay(), 2);
  const s = getCurrentStatus(d);
  assert.equal(s.label, "Coding");
  assert.equal(s.accent, "cobalt");
});

test("weekday overnight is sleeping", () => {
  assert.equal(getCurrentStatus(at(2026, 5, 16, 3)).label, "Sleeping"); // Tue 3am
});

test("weekday dawn is journaling, then the gym", () => {
  assert.equal(getCurrentStatus(at(2026, 5, 16, 7)).label, "Journaling"); // Tue 7am
  assert.equal(getCurrentStatus(at(2026, 5, 16, 9)).label, "At The Gym"); // Tue 9am
});

// --- Day-specific events override the generic weekday blocks ---

test("Monday late morning is the coaching call, not coding", () => {
  const d = at(2026, 5, 15, 11, 30); // Monday 11:30am
  assert.equal(d.getDay(), 1);
  const s = getCurrentStatus(d);
  assert.equal(s.label, "Coaching Call");
  assert.equal(s.accent, "magenta");
});

test("Monday evening is group study", () => {
  assert.equal(getCurrentStatus(at(2026, 5, 15, 20)).label, "Group Study"); // Mon 8pm
});

test("Wednesday evening is friends night", () => {
  const d = at(2026, 5, 17, 20); // Wednesday 8pm
  assert.equal(d.getDay(), 3);
  assert.equal(getCurrentStatus(d).label, "Friends Night");
});

test("Thursday evening is the best-friend meetup", () => {
  const d = at(2026, 5, 18, 19); // Thursday 7pm
  assert.equal(d.getDay(), 4);
  assert.equal(getCurrentStatus(d).label, "Best Friend");
});

// --- Weekends ---

test("Sunday morning is journaling until church takes over at 9", () => {
  const d8 = at(2026, 5, 21, 8); // Sunday 8am
  assert.equal(d8.getDay(), 0);
  assert.equal(getCurrentStatus(d8).label, "Journaling");
  assert.equal(getCurrentStatus(at(2026, 5, 21, 10)).label, "At Church"); // Sun 10am
});

test("Saturday journaling ends by 8:30, unlike Sunday", () => {
  assert.equal(getCurrentStatus(at(2026, 5, 20, 8)).label, "Journaling"); // Sat 8am
  // 9am Saturday is no longer journaling (Sat block ends at 8.5).
  assert.equal(getCurrentStatus(at(2026, 5, 20, 9)).label, "Project Work");
});

test("weekend afternoon is self-study", () => {
  const d = at(2026, 5, 20, 13); // Saturday 1pm
  assert.equal(getCurrentStatus(d).label, "Self-Study");
});

// --- Boundary semantics: inclusive `from`, exclusive `to`, fractional hours ---

test("boundaries are inclusive of `from`, exclusive of `to`", () => {
  // Weekday: 10..13 -> Coding; 13..13.5 -> Break Time.
  assert.equal(getCurrentStatus(at(2026, 5, 16, 10)).label, "Coding");
  assert.equal(getCurrentStatus(at(2026, 5, 16, 13)).label, "Break Time");
});

test("fractional-hour boundaries resolve on the half hour", () => {
  // Gym runs 8.5..10. 8:29 is still journaling; 8:30 flips to the gym.
  assert.equal(getCurrentStatus(at(2026, 5, 16, 8, 29)).label, "Journaling");
  assert.equal(getCurrentStatus(at(2026, 5, 16, 8, 30)).label, "At The Gym");
});

test("returns a well-formed status object", () => {
  const s = getCurrentStatus(at(2026, 5, 16, 10));
  assert.ok(typeof s.label === "string" && s.label.length > 0);
  assert.ok(typeof s.detail === "string");
  assert.ok(typeof s.accent === "string");
});
