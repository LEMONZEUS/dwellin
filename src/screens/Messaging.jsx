import { useEffect, useRef, useState } from "react";
import { Shell } from "../components/Shell";
import { Modal, FormError } from "../components/Ui";
import { SendIcon } from "../components/Icons";
import { useStore } from "../lib/store";
import { sendToTeam } from "../lib/messaging";
import { money, prettyStamp, MONTHS } from "../lib/dates";

export function Messages() {
  const { user, actions } = useStore();
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    actions.markRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.messages.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [user.messages.length]);

  const send = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    sendToTeam(actions, t);
    setText("");
  };

  return (
    <Shell title="Messaging" back={true} scroll={false}>
      <div className="thread" aria-live="polite">
        {user.messages.length === 0 && <div className="empty">No Messages Found</div>}
        {user.messages.map((m) => (
          <div key={m.id} className={"msg " + (m.from === "resident" ? "me" : "team")}>
            <div className="bubble">{m.text}</div>
            {m.attachment && (
              <div className="attach">
                <span className="mono">Sent with your question</span>
                {m.attachment.section ? (
                  <>
                    <p>Concierge answer from Section {m.attachment.section.n}, {m.attachment.section.title} (updated {m.attachment.section.updated}):</p>
                    <p>“{m.attachment.section.answer}”</p>
                    <p>You marked it: Not quite</p>
                  </>
                ) : (
                  <p>The concierge found no matching FAQ section.</p>
                )}
              </div>
            )}
            <span className="stamp">
              {m.from === "team" ? (m.automated ? "Automated reply · " : "Community team · ") : ""}
              {prettyStamp(m.at)}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form className="composer" onSubmit={send}>
        <label htmlFor="msg" className="sr">Message the community team</label>
        <input id="msg" value={text} onChange={(e) => setText(e.target.value)} placeholder="Message the community team…" autoComplete="off" />
        <button type="submit" className="send" aria-label="Send message"><SendIcon /></button>
      </form>
    </Shell>
  );
}

export function Payments() {
  const { user, actions } = useStore();
  const [confirm, setConfirm] = useState(false);
  const [notice, setNotice] = useState("");
  const now = new Date();
  const rows = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { label: MONTHS[d.getMonth()], paid: i > 0 || user.balance === 0 };
  });

  const pay = () => {
    actions.pay(user.balance);
    setConfirm(false);
    setNotice("Payment received. Thank you.");
  };

  return (
    <Shell title="Payments" back="/home">
      <p className="muted">Logged in as: {user.email}</p>

      <section className="card navy">
        <span className="mono">As of {MONTHS[now.getMonth()]} {now.getFullYear()}</span>
        <p className="balance">Current Balance: {money(user.balance)}</p>
        <button type="button" className="pill small light" disabled={user.balance === 0} onClick={() => setConfirm(true)}>
          Pay
        </button>
      </section>
      {notice && <p className="ok" role="status">{notice}</p>}

      <section className="card navy">
        <h2 className="card-title">Monthly Charges</h2>
        <ul className="charges">
          {rows.map((r) => (
            <li key={r.label}>
              <span>{r.label}</span>
              <span className="mono">{r.paid ? "Paid" : "Due"}</span>
              <span>{money(3173)}</span>
            </li>
          ))}
        </ul>
      </section>

      {confirm && (
        <Modal label="Confirm payment" onClose={() => setConfirm(false)}>
          <h2>Pay {money(user.balance)}?</h2>
          <p className="muted">This is a demo. No money moves.</p>
          <div className="btn-row">
            <button type="button" className="pill" onClick={pay}>Confirm</button>
            <button type="button" className="pill ghost" onClick={() => setConfirm(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </Shell>
  );
}
