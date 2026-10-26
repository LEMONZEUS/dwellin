import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dark, Shell } from "../components/Shell";
import { Field, FormError, Modal } from "../components/Ui";
import { DocIcon, HelpIcon, LockIcon, UserIcon } from "../components/Icons";
import { useStore } from "../lib/store";
import { BUILDING, PRIVACY, TERMS } from "../data/seed";

const maskEmail = (e) => {
  const [n, d] = e.split("@");
  return `${n.slice(0, 2)}${"•".repeat(Math.max(2, n.length - 2))}@${d}`;
};
const maskPhone = (p) => (p ? p.replace(/\d(?=(?:\D*\d){2})/g, "•") : "Not added");

// Formats a phone number as 416-555-0142 while typing. A leading 1 (country code) is dropped.
const formatPhone = (value) => {
  let d = String(value || "").replace(/\D/g, "");
  if (d.length > 10 && d.startsWith("1")) d = d.slice(1);
  d = d.slice(0, 10);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join("-");
};

export function Profile() {
  const { user, actions } = useStore();
  const [reveal, setReveal] = useState(false);

  // password dialog
  const [pwOpen, setPwOpen] = useState(false);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // edit-details dialog
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: "", contactEmail: "", unit: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const setField = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const openEdit = () => {
    setForm({
      name: user.name || "",
      contactEmail: user.contactEmail || user.email || "",
      unit: user.unit || "",
      phone: formatPhone(user.phone),
    });
    setErrors({});
    setEditOpen(true);
  };

  const validate = (f) => {
    const er = {};
    if (!f.name.trim()) er.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(f.contactEmail.trim())) er.contactEmail = "Enter a valid email address.";
    if (f.unit.trim().length > 10) er.unit = "Use 10 characters or fewer.";
    if (f.phone.trim() && f.phone.replace(/\D/g, "").length !== 10)
      er.phone = "Enter a 10-digit phone number, for example 416-555-0142.";
    return er;
  };

  const save = (e) => {
    e.preventDefault();
    const er = validate(form);
    setErrors(er);
    if (Object.keys(er).length) return;
    actions.updateProfile({
      name: form.name.trim(),
      contactEmail: form.contactEmail.trim(),
      unit: form.unit.trim(),
      phone: formatPhone(form.phone),
    });
    setEditOpen(false);
    setSaved(true);
  };

  const update = (e) => {
    e.preventDefault();
    if (next.length < 8) return setError("Use at least 8 characters.");
    const res = actions.updatePassword(cur, next);
    if (!res.ok) return setError(res.error);
    setPwOpen(false); setCur(""); setNext(""); setError(""); setDone(true);
  };

  return (
    <Shell title="My Profile" back="/home">
      <div className="profile-head">
        <div className="avatar" aria-hidden="true">{initials || "?"}</div>
        <div>
          <h2>{user.name}</h2>
          <p className="muted">{user.unit ? `Apartment ${user.unit}` : "Apartment not added"}</p>
        </div>
      </div>

      <section className="card navy">
        <h3>My Account Info</h3>
        <dl className="info-list">
          <div><dt>Name</dt><dd>{user.name}</dd></div>
          <div><dt>Login Email</dt><dd>{reveal ? user.email : maskEmail(user.email)}</dd></div>
          <div><dt>Contact Email</dt><dd>{reveal ? user.contactEmail || "Not added" : maskEmail(user.contactEmail || user.email)}</dd></div>
          <div><dt>Phone</dt><dd>{reveal ? formatPhone(user.phone) || "Not added" : maskPhone(formatPhone(user.phone))}</dd></div>
          <div><dt>Apartment</dt><dd>{user.unit || "Not added"}</dd></div>
        </dl>
        {saved && <p className="ok" role="status">Profile updated.</p>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button type="button" className="pill small light" aria-pressed={reveal} onClick={() => setReveal((r) => !r)}>
            {reveal ? "Hide" : "Reveal"}
          </button>
          <button type="button" className="pill small light" onClick={openEdit}>Edit</button>
        </div>
      </section>

      <section className="card navy">
        <h3>Password</h3>
        <p>Choose a new password for your account.</p>
        {done && <p className="ok" role="status">Password updated.</p>}
        <button type="button" className="pill small light" onClick={() => setPwOpen(true)}>Update</button>
      </section>

      <Link to="/delete" className="pill danger-pill">Delete Account</Link>

      {editOpen && (
        <Modal label="Edit account info" onClose={() => setEditOpen(false)}>
          <form onSubmit={save} noValidate style={{ display: "grid", gap: 14 }}>
            <h2>Edit account info</h2>
            <Field id="ed-name" label="Name" value={form.name} onChange={setField("name")} autoComplete="name" error={errors.name} />
            <Field id="ed-email" label="Contact email" type="email" value={form.contactEmail} onChange={setField("contactEmail")} autoComplete="email" error={errors.contactEmail} />
            <Field id="ed-unit" label="Apartment number" value={form.unit} onChange={setField("unit")} placeholder="e.g. 1204" error={errors.unit} />
            <Field id="ed-phone" label="Phone number" type="tel" inputMode="numeric" value={form.phone} onChange={(v) => setField("phone")(formatPhone(v))} placeholder="416-555-0142" autoComplete="tel" error={errors.phone} />
            <p className="muted small">Your login email ({maskEmail(user.email)}) stays the same and is still used to sign in.</p>
            <div className="btn-row">
              <button type="submit" className="pill">Save</button>
              <button type="button" className="pill ghost" onClick={() => setEditOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {pwOpen && (
        <Modal label="Update password" onClose={() => setPwOpen(false)}>
          <form onSubmit={update} noValidate style={{ display: "grid", gap: 14 }}>
            <h2>Update password</h2>
            <Field id="pw-cur" label="Current password" type="password" value={cur} onChange={setCur} autoComplete="current-password" />
            <Field id="pw-new" label="New password" type="password" value={next} onChange={setNext} autoComplete="new-password" />
            <FormError>{error}</FormError>
            <div className="btn-row">
              <button type="submit" className="pill">Confirm</button>
              <button type="button" className="pill ghost" onClick={() => setPwOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </Shell>
  );
}

export function DeleteAccount() {
  const { actions } = useStore();
  const navigate = useNavigate();
  return (
    <Dark close={true}>
      <div className="auth-form center-col">
        <h1 className="dark-title">Delete Account</h1>
        <p className="center">Are you sure you want to delete this account?</p>
        <div className="btn-row">
          <button type="button" className="pill" onClick={() => { actions.deleteAccount(); navigate("/login"); }}>Confirm</button>
          <button type="button" className="pill ghost" onClick={() => navigate("/profile")}>Cancel</button>
        </div>
      </div>
    </Dark>
  );
}

export function Menu() {
  const { actions } = useStore();
  const navigate = useNavigate();
  const items = [
    { to: "/terms", label: "Terms of Service", Icon: DocIcon },
    { to: "/privacy", label: "Privacy Policy", Icon: LockIcon },
    { to: "/faq", label: "Property FAQ's", Icon: HelpIcon },
  ];
  return (
    <Dark close={true}>
      <h1 className="dark-title">{BUILDING.name}</h1>
      <p className="center muted-light">{BUILDING.address}</p>
      <ul className="menu">
        {items.map(({ to, label, Icon }) => (
          <li key={to}>
            <Link to={to}><Icon /> {label}</Link>
          </li>
        ))}
      </ul>
      <button type="button" className="logout" onClick={() => { actions.logout(); navigate("/login"); }}>Logout</button>
      <button type="button" className="logout dim" onClick={() => actions.resetDemo()}>Reset demo data</button>
    </Dark>
  );
}

export function Legal({ kind }) {
  const terms = kind === "terms";
  return (
    <Shell title={terms ? "Terms of Service" : "Privacy Policy"} back={true}>
      {(terms ? TERMS : PRIVACY).map((t, i) => (
        <p key={i}>{t}</p>
      ))}
    </Shell>
  );
}