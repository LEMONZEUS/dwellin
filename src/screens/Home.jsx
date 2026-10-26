import { useState } from "react";
import { Link } from "react-router-dom";
import { Shell } from "../components/Shell";
import { DollarIcon } from "../components/Icons";
import { useStore } from "../lib/store";
import { AMENITIES, POSTS } from "../data/seed";
import { money, prettyDate, prettyTime, toKey } from "../lib/dates";

export function Home() {
  const { user, actions } = useStore();
  const upcoming = [...user.reservations]
    .filter((r) => r.date >= toKey(new Date()))
    .sort((a, b) => (a.date + String(a.start).padStart(4, "0")).localeCompare(b.date + String(b.start).padStart(4, "0")));

  return (
    <Shell title="Welcome Home">
      <div className="tabs">
        <Link to="/amenities" className="pill small">Amenities</Link>
        <Link to="/community" className="pill small">Bulletin Board</Link>
      </div>

      <h2 className="section">Things to do…</h2>

      <section className="card navy">
        <h3>Community Board</h3>
        <p>{POSTS.length} notices from your community team.</p>
        <Link to="/community" className="pill small light">View</Link>
      </section>

      <section className="card navy">
        <div className="card-row">
          <DollarIcon className="card-icon" />
          <div>
            <h3>My Payments</h3>
            <p>Summary Details &amp; History</p>
            <p className="mono">Balance {money(user.balance)}</p>
          </div>
        </div>
        <Link to="/payments" className="pill small light">Payments</Link>
      </section>

      <h2 className="section">Upcoming reservations</h2>
      {upcoming.length === 0 ? (
        <p className="muted">No reservations yet. Book the gym or the conference room.</p>
      ) : (
        <ul className="list">
          {upcoming.map((r) => (
            <li key={r.id}>
              <div>
                <strong>{AMENITIES.find((a) => a.id === r.amenityId)?.name}</strong>
                <span className="muted">{prettyDate(r.date)} · {prettyTime(r.start)} · {r.duration} min</span>
              </div>
              <button type="button" className="link" onClick={() => actions.cancelReservation(r.id)}>Cancel</button>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}

export function Community() {
  const [tag, setTag] = useState("All");
  const tags = ["All", "Event", "Maintenance", "Safety"];
  const posts = POSTS.filter((p) => tag === "All" || p.tag === tag);
  return (
    <Shell title="Community Board" back="/home">
      <div className="chips" role="group" aria-label="Filter notices">
        {tags.map((t) => (
          <button key={t} type="button" className={"chip" + (t === tag ? " on" : "")} aria-pressed={t === tag} onClick={() => setTag(t)}>
            {t}
          </button>
        ))}
      </div>
      {posts.length === 0 ? (
        <div className="empty">No Events Found</div>
      ) : (
        posts.map((p) => (
          <article key={p.id} className="post">
            <span className="mono">{p.tag}</span>
            <h2>{p.title}</h2>
            <p className="muted">{p.when}</p>
            <p>{p.body}</p>
          </article>
        ))
      )}
    </Shell>
  );
}
