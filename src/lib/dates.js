export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const pad = (n) => String(n).padStart(2, "0");

// "YYYY-MM-DD" in local time
export function toKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function prettyDate(key) {
  const d = fromKey(key);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// minutes since midnight -> "10:30 am"
export function prettyTime(mins) {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 >= 12 ? "pm" : "am";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${pad(m)} ${suffix}`;
}

export function nowStamp() {
  return new Date().toISOString();
}

export function prettyStamp(iso) {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${prettyTime(d.getHours() * 60 + d.getMinutes())}`;
}

export const money = (n) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 });
