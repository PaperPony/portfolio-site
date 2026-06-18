// Status schedule for the "what I'm doing right now" bar.
//
// This is NOT live data (yet). `lib/status.jsx` picks a status from these rules
// based on the day of week + time of day. To change what the bar shows, edit
// the rules below — first matching rule wins.
//
//   days:   array of weekday numbers (0 = Sunday ... 6 = Saturday)
//   from/to: hours in 24h local time, [from, to) — `to` is exclusive
//   accent:  neon palette key (magenta | purple | cobalt | ember | lime)
//
// TODO: later, replace this schedule with a live source (calendar, presence API).

const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKEND = [0, 6];

export const statusSchedule = {
  // Shown when no rule matches — also a safe default.
  fallback: {
    label: "Around",
    detail: "Reach out anytime",
    accent: "cobalt",
  },
  rules: [
    // --- Weekdays ---
    { days: WEEKDAYS, from: 0, to: 6, label: "Off the clock", detail: "Sleeping — back soon", accent: "purple" },
    { days: WEEKDAYS, from: 6, to: 9, label: "Sketching ideas", detail: "Coffee & planning the day", accent: "ember" },
    { days: WEEKDAYS, from: 9, to: 12, label: "Deep in code", detail: "Heads-down building", accent: "cobalt" },
    { days: WEEKDAYS, from: 12, to: 13, label: "Recharging", detail: "Lunch break", accent: "lime" },
    { days: WEEKDAYS, from: 13, to: 15, label: "In a client call", detail: "Talking shop", accent: "magenta" },
    { days: WEEKDAYS, from: 15, to: 18, label: "Deep in code", detail: "Shipping features", accent: "cobalt" },
    { days: WEEKDAYS, from: 18, to: 24, label: "Off the clock", detail: "Recharging for tomorrow", accent: "purple" },

    // --- Weekends ---
    { days: WEEKEND, from: 0, to: 9, label: "Off the clock", detail: "Weekend mode", accent: "purple" },
    { days: WEEKEND, from: 9, to: 13, label: "Tinkering", detail: "Side projects & experiments", accent: "lime" },
    { days: WEEKEND, from: 13, to: 18, label: "Recharging", detail: "Outdoors & away from screens", accent: "ember" },
    { days: WEEKEND, from: 18, to: 24, label: "Sketching ideas", detail: "Dreaming up what's next", accent: "magenta" },
  ],
};

export default statusSchedule;
