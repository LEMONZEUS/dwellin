import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "../components/Shell";
import { SendIcon } from "../components/Icons";
import { useStore } from "../lib/store";
import { sendToTeam } from "../lib/messaging";
import { retrieve, search, sourceLine } from "../lib/retrieve";
import { CATEGORIES, RECOMMENDED, SECTIONS } from "../data/faqs";

// One page does everything: typing filters the guidelines live, pressing send asks the concierge,
// and the answer appears right under the box. Nothing replaces the page, so there is no blank screen.
//
// Concierge phases: thinking -> answered -> closed | escalated      (no match -> nomatch, sent to the team)
export function Faq() {
  const { actions } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [reply, setReply] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const found = useMemo(() => (query.trim() ? search(query) : null), [query]);
  const rows = useMemo(() => {
    const base = found ? found.map((f) => f.section) : SECTIONS;
    return cat === "All" ? base : base.filter((s) => s.category === cat);
  }, [found, cat]);

  const ask = (text) => {
    const q = text.trim();
    if (!q) return;
    clearTimeout(timer.current);
    setQuery(q);
    setCat("All");
    setReply({ q, phase: "thinking" });
    const quick = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => {
      const r = retrieve(q);
      if (r) {
        setReply({ q, phase: "answered", match: r.top, related: r.related, showFull: false });
      } else {
        sendToTeam(actions, q, { section: null });
        setReply({ q, phase: "nomatch" });
      }
    }, quick ? 0 : 700);
  };

  const submit = (e) => {
    e.preventDefault();
    ask(query);
  };

  const clear = () => {
    clearTimeout(timer.current);
    setReply(null);
    setQuery("");
    setCat("All");
  };

  const notQuite = () => {
    sendToTeam(actions, reply.q, { section: reply.match });
    setReply({ ...reply, phase: "escalated" });
  };

  const head = (
    <div className="who">
      <span className="dot" />
      <span className="mono">Dwellin Concierge</span>
    </div>
  );

  return (
    <Shell title="Property FAQ's" back="/home">
      <form onSubmit={submit} role="search">
        <label htmlFor="ask" className="mono">Search or ask about your building</label>
        <div className="ask">
          <input
            id="ask"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about your building…"
            maxLength={140}
            autoComplete="off"
            enterKeyHint="send"
          />
          <button type="submit" className="send" aria-label="Ask the concierge">
            <SendIcon />
          </button>
        </div>
      </form>

      {reply && (
        <div className="answer" aria-live="polite">
          <div className="asked">
            <span className="mono">You asked</span>
            <p>{reply.q}</p>
          </div>
          {head}

          {reply.phase === "thinking" && (
            <span className="think" aria-label="Searching the property guidelines"><i /><i /><i /></span>
          )}

          {reply.match && (
            <>
              <p>{reply.match.answer}</p>
              <div className="cite">
                <span className="mono">{sourceLine(reply.match)}</span>
                <button type="button" className="link" aria-expanded={reply.showFull} onClick={() => setReply({ ...reply, showFull: !reply.showFull })}>
                  {reply.showFull ? "Hide full guideline" : "Read full guideline"}
                </button>
                {reply.showFull && (
                  <div className="full">
                    <ul>
                      {reply.match.points.map((p) => <li key={p}>{p}</li>)}
                    </ul>
                    <p className="muted">{reply.match.body}</p>
                  </div>
                )}
              </div>

              {reply.related?.length > 0 && (
                <p className="muted small">
                  Also see:{" "}
                  {reply.related.map((r, i) => (
                    <span key={r.id}>
                      {i > 0 && ", "}
                      <button type="button" className="link" onClick={() => setReply({ ...reply, match: r, related: [], showFull: true })}>{r.title}</button>
                    </span>
                  ))}
                </p>
              )}

              {reply.phase === "answered" && (
                <div className="btn-row">
                  <button type="button" className="pill small" onClick={() => setReply({ ...reply, phase: "closed" })}>That answered it</button>
                  <button type="button" className="pill small ghost" onClick={notQuite}>Not quite</button>
                </div>
              )}
              {reply.phase === "closed" && (
                <>
                  <p className="muted">Glad that helped. Nothing was sent to the community team.</p>
                  <button type="button" className="pill small ghost" onClick={clear}>Ask another question</button>
                </>
              )}
              {reply.phase === "escalated" && (
                <>
                  <p className="muted">Sent to the community team with this answer attached, so you don't need to retype anything.</p>
                  <button type="button" className="pill small" onClick={() => navigate("/messages")}>Open message</button>
                </>
              )}
            </>
          )}

          {reply.phase === "nomatch" && (
            <>
              <p>I couldn't find this in the property guidelines, so I didn't guess. I've sent your question to the community team.</p>
              <p className="muted">You don't need to retype it. They will reply in Messaging.</p>
              <div className="btn-row">
                <button type="button" className="pill small" onClick={() => navigate("/messages")}>Open message</button>
                <button type="button" className="pill small ghost" onClick={clear}>Ask another question</button>
              </div>
            </>
          )}
        </div>
      )}

      {!reply && !query.trim() && (
        <section aria-labelledby="rec-h">
          <h2 id="rec-h" className="mono">Recommended questions</h2>
          <div className="chips">
            {RECOMMENDED.map((q) => (
              <button key={q} type="button" className="chip" onClick={() => ask(q)}>{q}</button>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="g-h">
        <div className="list-head">
          <h2 id="g-h" className="mono">{found ? `Matching guidelines (${rows.length})` : "All guidelines"}</h2>
          {(reply || query) && <button type="button" className="link" onClick={clear}>Clear</button>}
        </div>

        <div className="chips" role="group" aria-label="Filter by category">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} type="button" className={"chip" + (c === cat ? " on" : "")} aria-pressed={c === cat} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="muted nores">
            {found && found.length === 0
              ? `No guidelines match “${query.trim()}”. Press the send button and I'll pass your question to the community team.`
              : "No guidelines in this category match."}
          </p>
        ) : (
          <div className="faq">
            {rows.map((s) => (
              <details key={s.id}>
                <summary>
                  <span className="sum-title">
                    {s.title}
                    <span className="mono cat-tag">{s.category}</span>
                  </span>
                  <span className="upd">{s.updated}</span>
                </summary>
                <div className="body">
                  <p className="lead">{s.answer}</p>
                  <ul>
                    {s.points.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                  <p>{s.body}</p>
                  <p className="mono foot">Section {s.n} · Updated {s.updated}</p>
                </div>
              </details>
            ))}
          </div>
        )}
        <p className="muted small samplenote">These guidelines are sample content for the demo building.</p>
      </section>
    </Shell>
  );
}
