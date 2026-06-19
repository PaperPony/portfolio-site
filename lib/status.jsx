// Pure status resolver. Given a Date, returns the matching status from the
// schedule. No side effects, no `new Date()` inside — caller passes the date,
// which keeps this trivially unit-testable. See lib/status.test.jsx.
import { statusSchedule } from "../content/statuses.jsx";

/**
 * Resolve the current status for a given moment.
 *
 * Rules are evaluated top-to-bottom and the FIRST match wins, so place
 * day-specific events (e.g. a Monday coaching call) above the broad daily
 * blocks they should override.
 *
 * @param {Date} date - the moment to resolve a status for.
 * @param {object} [schedule] - schedule to read from (defaults to statusSchedule).
 * @returns {{label: string, detail: string, accent: string}}
 */
export function getCurrentStatus(date = new Date(), schedule = statusSchedule) {
  const day = date.getDay(); // 0 (Sun) - 6 (Sat)
  const hour = date.getHours() + date.getMinutes() / 60;

  const match = schedule.rules.find(
    (rule) =>
      rule.days.includes(day) && hour >= rule.from && hour < rule.to
  );

  const { label, detail, accent } = match ?? schedule.fallback;
  return { label, detail, accent };
}

export default getCurrentStatus;
