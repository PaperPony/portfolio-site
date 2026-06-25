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

// Single-day helpers for day-specific events (0 = Sunday ... 6 = Saturday).
const SUN = [0];
const MON = [1];
const WED = [3];
const THU = [4];
const SAT = [6];

export const statusSchedule = {
  // Shown when no rule matches — also a safe default.
  fallback: {
    label: "Around",
    detail: "Reach out anytime",
    accent: "cobalt",
  },
  rules: [
    // --- Day-specific events (checked first; they override the daily blocks) ---
    { days: MON, from: 11, to: 12.25, label: "Coaching Call", detail: "Weekly Mindset Training", accent: "magenta" },
    { days: MON, from: 19, to: 21, label: "Group Study", detail: "", accent: "purple" },
    { days: WED, from: 19, to: 21, label: "Friends Night", detail: "Weekly meetup", accent: "lime" },
    { days: THU, from: 18.5, to: 21.5, label: "With My Best Friend", detail: "Catching up", accent: "ember" },
    { days: SAT, from: 6, to: 8.5, label: "Journaling", detail: "And drinking coffee. I love coffee.", accent: "ember" },
    { days: SUN, from: 6, to: 9, label: "Journaling", detail: "And drinking coffee. I love coffee.", accent: "ember" },
    { days: SUN, from: 9, to: 12.5, label: "At Church", detail: "", accent: "cobalt" },

    // --- Weekdays ---
    { days: WEEKDAYS, from: 0, to: 6, label: "Sleeping", detail: "Yes, I do that sometimes", accent: "purple" },
    { days: WEEKDAYS, from: 6, to: 8.5, label: "Journaling", detail: "And drinking coffee. I love coffee.", accent: "ember" },
    { days: WEEKDAYS, from: 8.5, to: 10, label: "At The Gym", detail: "Calisthenics", accent: "lime" },
    { days: WEEKDAYS, from: 10, to: 13, label: "Coding", detail: "Shipping features for clients", accent: "cobalt" },
    { days: WEEKDAYS, from: 13, to: 13.5, label: "Break Time", detail: "Probably getting coffee", accent: "lime" },
    { days: WEEKDAYS, from: 13.5, to: 16, label: "Deep Work", detail: "Testing code", accent: "cobalt" },
    { days: WEEKDAYS, from: 16, to: 17.5, label: "Light Work", detail: "Networking with clients", accent: "magenta" },
    { days: WEEKDAYS, from: 17.5, to: 18.5, label: "Grabbing Dinner", detail: "", accent: "ember" },
    { days: WEEKDAYS, from: 18.5, to: 21, label: "Out With Friends", detail: "Avoiding screens", accent: "lime" },
    { days: WEEKDAYS, from: 21, to: 24, label: "Sleeping", detail: "Yes, I do that sometimes", accent: "purple" },

    // --- Weekends ---
    { days: WEEKEND, from: 0, to: 6, label: "Sleeping", detail: "Yes, I do that sometimes", accent: "purple" },
    { days: WEEKEND, from: 8.5, to: 12, label: "Project Work", detail: "And business stuff", accent: "cobalt" },
    { days: WEEKEND, from: 12, to: 17.5, label: "Self-Study", detail: "Reading & learning", accent: "lime" },
    { days: WEEKEND, from: 17.5, to: 21, label: "Out Exploring", detail: "Anywhere but a screen", accent: "magenta" },
    { days: WEEKEND, from: 21, to: 24, label: "Sleeping", detail: "Yes, I do that sometimes", accent: "purple" },
  ],
};

export default statusSchedule;
