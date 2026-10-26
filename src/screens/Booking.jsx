import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { Shell } from "../components/Shell";
import { CalendarIcon } from "../components/Icons";
import { Calendar, Field, FormError, Modal } from "../components/Ui";
import { useStore } from "../lib/store";
import { AMENITIES } from "../data/seed";
import { prettyDate, prettyTime, toKey } from "../lib/dates";
import { asset } from "../lib/assets";

// Hours that are already taken by other residents in this demo building.
const BUSY = {
  conference: [{ start: 12 * 60, end: 13 * 60 }],
  gym: [{ start: 18 * 60, end: 19 * 60 }],
  "game-room": [{ start: 19 * 60, end: 21 * 60 }],
  theatre: [{ start: 20 * 60, end: 22 * 60 }],
  "golf-simulator": [{ start: 17 * 60, end: 18 * 60 }],
};
const DURATIONS = [30, 60, 90, 120];

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;
const findAmenity = (id) => AMENITIES.find((a) => a.id === id);

export function Amenities() {
  return (
    <Shell title="Amenity Reservations" back="/home">
      <div className="amenity-grid">
        {AMENITIES.map((a) => (
          <article key={a.id} className="amenity">
            <img className="amenity-photo" src={asset(a.image)} alt={a.alt} loading="lazy" />
            <h2>{a.name}</h2>
            <p>{a.blurb}</p>
            <Link to={`/schedule/${a.id}`} className="pill small">Book</Link>
          </article>
        ))}
      </div>
    </Shell>
  );
}

export function Schedule() {
  const { id } = useParams();
  const { user } = useStore();
  const navigate = useNavigate();
  const amenity = findAmenity(id);
  const today = toKey(new Date());
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState(60);
  const [start, setStart] = useState(null);
  const [calOpen, setCalOpen] = useState(false);
  const [error, setError] = useState("");

  const slots = useMemo(() => {
    if (!amenity) return [];
    const out = [];
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    for (let t = amenity.open; t + duration <= amenity.close; t += 30) {
      const busy = (BUSY[amenity.id] || []).some((b) => overlaps(t, t + duration, b.start, b.end));
      const mine = user.reservations.some(
        (r) => r.amenityId === amenity.id && r.date === date && overlaps(t, t + duration, r.start, r.start + r.duration)
      );
      const past = date === today && t <= nowMins;
      out.push({ t, disabled: busy || mine || past, reason: busy ? "Taken" : mine ? "Yours" : past ? "Past" : "" });
    }
    return out;
  }, [amenity, date, duration, user.reservations, today]);

  if (!amenity) return <Navigate to="/amenities" replace />;

  const next = () => {
    if (start === null) return setError("Choose a start time first.");
    navigate("/review", { state: { amenityId: amenity.id, date, start, duration } });
  };

  const changeDuration = (d) => {
    setDuration(d);
    setStart(null);
  };

  return (
    <Shell title="Schedule" back="/amenities">
      <div className="amenity-banner">
        <img src={asset(amenity.image)} alt={amenity.alt} />
        <span>{amenity.name}</span>
      </div>

      <div className="date-row">
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="date-display">Date</label>
          <input id="date-display" readOnly value={prettyDate(date)} onClick={() => setCalOpen(true)} />
        </div>
        <button type="button" className="icon-pill" onClick={() => setCalOpen(true)} aria-label="Open calendar">
          <CalendarIcon />
        </button>
      </div>

      <div className="field">
        <label htmlFor="duration">Length</label>
        <select id="duration" value={duration} onChange={(e) => changeDuration(Number(e.target.value))}>
          {DURATIONS.map((d) => (
            <option key={d} value={d}>{d < 60 ? `${d} minutes` : d === 60 ? "1 hour" : `${d / 60} hours`}</option>
          ))}
        </select>
      </div>

      <p className="hint">Choose a start time. Minimum 30 minute reservation.</p>

      <div className="slots" role="group" aria-label="Start times">
        {slots.map((s) => (
          <button
            key={s.t}
            type="button"
            disabled={s.disabled}
            className={"slot" + (start === s.t ? " sel" : "")}
            aria-pressed={start === s.t}
            onClick={() => { setStart(s.t); setError(""); }}
            title={s.reason || undefined}
          >
            {prettyTime(s.t)}
          </button>
        ))}
        {!slots.length && <p className="hint">No times fit that length. Try a shorter one.</p>}
      </div>

      <FormError>{error}</FormError>
      <button type="button" className="pill" onClick={next}>Confirm</button>

      {calOpen && (
        <Modal label="Choose a date" onClose={() => setCalOpen(false)}>
          <Calendar
            value={date}
            minKey={today}
            onChange={(k) => { setDate(k); setStart(null); setCalOpen(false); }}
          />
          <button type="button" className="pill" onClick={() => setCalOpen(false)}>Confirm</button>
        </Modal>
      )}
    </Shell>
  );
}

export function Review() {
  const { state: nav } = useLocation();
  const { user, actions } = useStore();
  const navigate = useNavigate();
  const [unit, setUnit] = useState(user.unit || "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  if (!nav) return <Navigate to="/amenities" replace />;
  const amenity = findAmenity(nav.amenityId);

  const submit = () => {
    if (!unit.trim()) return setError("Enter your apartment number.");
    const clash = user.reservations.some(
      (r) => r.amenityId === nav.amenityId && r.date === nav.date && overlaps(nav.start, nav.start + nav.duration, r.start, r.start + r.duration)
    );
    if (clash) return setError("You already have a reservation at that time.");
    if (!user.unit) actions.updateProfile({ unit: unit.trim() });
    const entry = actions.reserve({ amenityId: nav.amenityId, date: nav.date, start: nav.start, duration: nav.duration, notes: notes.trim(), unit: unit.trim() });
    navigate("/confirmation", { state: { id: entry.id }, replace: true });
  };

  return (
    <Shell title="Review Reservation" back={true}>
      <dl className="summary">
        <div><dt>Name</dt><dd>{user.name}</dd></div>
        <div><dt>Amenity Reserved</dt><dd>{amenity.name}</dd></div>
        <div><dt>Date</dt><dd>{prettyDate(nav.date)}</dd></div>
        <div><dt>Start Time</dt><dd>{prettyTime(nav.start)}</dd></div>
        <div><dt>Length</dt><dd>{nav.duration} minutes</dd></div>
      </dl>
      <Field id="unit" label="Apartment No." value={unit} onChange={setUnit} placeholder="e.g. 1204" />
      <div className="field">
        <label htmlFor="notes">Additional Notes</label>
        <textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything the community team should know" />
      </div>
      <FormError>{error}</FormError>
      <div className="btn-row">
        <button type="button" className="pill" onClick={submit}>Submit</button>
        <button type="button" className="pill ghost" onClick={() => navigate("/home")}>Cancel</button>
      </div>
    </Shell>
  );
}

export function Confirmation() {
  const { state: nav } = useLocation();
  const { user } = useStore();
  const res = user.reservations.find((r) => r.id === nav?.id);
  if (!res) return <Navigate to="/home" replace />;
  const amenity = findAmenity(res.amenityId);
  return (
    <Shell title="Confirmation">
      <p>Confirmation successfully sent on {prettyDate(toKey(new Date(res.createdAt)))}.</p>
      <dl className="summary">
        <div><dt>Amenity</dt><dd>{amenity.name}</dd></div>
        <div><dt>Date</dt><dd>{prettyDate(res.date)}</dd></div>
        <div><dt>Time</dt><dd>{prettyTime(res.start)} to {prettyTime(res.start + res.duration)}</dd></div>
      </dl>
      <Link to="/home" className="pill">Back to Home Page</Link>
    </Shell>
  );
}
