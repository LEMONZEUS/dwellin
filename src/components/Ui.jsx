import { useEffect, useRef, useState } from "react";
import { MONTHS, toKey } from "../lib/dates";
import { BackIcon } from "./Icons";

export function Field({ id, label, type = "text", value, onChange, placeholder, autoComplete, error, ...rest }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${id}-err`} className="field-err">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return (
    <p className="form-err" role="alert">
      {children}
    </p>
  );
}

// Centered dialog. Closes on Escape and when the backdrop is clicked.
export function Modal({ onClose, label, children }) {
  const ref = useRef(null);
  // Keep the newest onClose in a ref so the effect below runs only once, when the dialog opens.
  // (Depending on onClose re-ran it on every keystroke and stole focus from the input.)
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, []);

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} ref={ref}>
        {children}
      </div>
    </div>
  );
}

// Month calendar as drawn in the wireframes (S M T W T F S with the month name in a pill).
export function Calendar({ value, onChange, minKey }) {
  const start = value ? new Date(value + "T00:00") : new Date();
  const [cursor, setCursor] = useState(new Date(start.getFullYear(), start.getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const todayKey = toKey(new Date());

  return (
    <div className="cal">
      <div className="cal-head">
        <button type="button" className="cal-nav" onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Previous month">
          <BackIcon />
        </button>
        <div className="cal-pill" aria-live="polite">
          {MONTHS[month]} {year}
        </div>
        <button type="button" className="cal-nav flip" onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Next month">
          <BackIcon />
        </button>
      </div>
      <div className="cal-grid" role="grid">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className={"cal-dow" + (i === 0 ? " sun" : "")} role="columnheader">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const disabled = minKey && key < minKey;
          const selected = key === value;
          const sunday = (i % 7) === 0;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              className={"cal-day" + (selected ? " sel" : "") + (sunday ? " sun" : "") + (key === todayKey ? " today" : "")}
              onClick={() => onChange(key)}
              aria-pressed={selected}
              aria-label={`${MONTHS[month]} ${d}, ${year}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}