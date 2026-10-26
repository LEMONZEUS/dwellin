import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Dark } from "../components/Shell";
import { Field, FormError } from "../components/Ui";
import { useStore } from "../lib/store";
import { DEMO_USER } from "../data/seed";

const maskEmail = (e) => {
  const [name, domain] = e.split("@");
  return `${name.slice(0, 2)}${"•".repeat(Math.max(2, name.length - 2))}@${domain}`;
};

export function Login() {
  const { actions, user } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/home" replace />;

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError("Enter your email and password.");
    const res = actions.login(email, password);
    if (!res.ok) return setError(res.error);
    navigate("/home");
  };

  return (
    <Dark>
      <form className="auth-form" onSubmit={submit} noValidate>
        <div className="brand">Dwellin</div>
        <Field id="login-email" label="Username" type="email" value={email} onChange={setEmail} placeholder="Email…" autoComplete="username" />
        <Field id="login-password" label="Password" type="password" value={password} onChange={setPassword} placeholder="Password…" autoComplete="current-password" />
        <FormError>{error}</FormError>
        <button type="submit" className="pill">Login</button>
        <div className="auth-links">
          <Link to="/forgot">Forgot password</Link>
          <span aria-hidden="true" />
          <Link to="/register">Register</Link>
        </div>
        <div className="demo">
          <span className="mono">Demo account</span>
          <p>{DEMO_USER.email} · {DEMO_USER.password}</p>
          <button type="button" className="pill ghost" onClick={() => { setEmail(DEMO_USER.email); setPassword(DEMO_USER.password); setError(""); }}>
            Fill in demo login
          </button>
        </div>
      </form>
    </Dark>
  );
}

export function Register() {
  const { actions } = useStore();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", again: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = "Enter a valid email address.";
    if (f.password.length < 8) er.password = "Use at least 8 characters.";
    if (f.again !== f.password) er.again = "The passwords don't match.";
    setErrors(er);
    if (Object.keys(er).length) return;
    const res = actions.startRegister(f);
    if (!res.ok) return setFormError(res.error);
    navigate("/verify");
  };

  return (
    <Dark close="/login">
      <form className="auth-form" onSubmit={submit} noValidate>
        <Field id="reg-name" label="Name" value={f.name} onChange={set("name")} placeholder="Full Name…" autoComplete="name" error={errors.name} />
        <Field id="reg-email" label="Username" type="email" value={f.email} onChange={set("email")} placeholder="Email…" autoComplete="email" error={errors.email} />
        <Field id="reg-pass" label="Password" type="password" value={f.password} onChange={set("password")} placeholder="Password…" autoComplete="new-password" error={errors.password} />
        <Field id="reg-again" label="Re-type Password" type="password" value={f.again} onChange={set("again")} placeholder="Password…" autoComplete="new-password" error={errors.again} />
        <FormError>{formError}</FormError>
        <button type="submit" className="pill">Confirm</button>
      </form>
    </Dark>
  );
}

export function Verify() {
  const { state, actions } = useStore();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const p = state.pending;

  if (!p) return <Navigate to="/login" replace />;

  const submit = (e) => {
    e.preventDefault();
    const res = actions.verify(code);
    if (!res.ok) return setError(res.error);
    navigate(res.kind === "register" ? "/account-created" : "/reset");
  };

  return (
    <Dark close="/login">
      <form className="auth-form" onSubmit={submit} noValidate>
        <p className="center">Verification code sent to {maskEmail(p.email)}</p>
        <Field id="code" label="Verification Code" value={code} onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit Code" inputMode="numeric" autoComplete="one-time-code" />
        <FormError>{error}</FormError>
        <button type="submit" className="pill">Confirm</button>
        <div className="demo">
          <span className="mono">Demo mode</span>
          <p>No email is sent in this prototype. Your code is <strong>{p.code}</strong>.</p>
          <button type="button" className="pill ghost" onClick={() => setCode(p.code)}>Fill in code</button>
        </div>
      </form>
    </Dark>
  );
}

export function AccountCreated() {
  return (
    <Dark>
      <div className="auth-form center-col">
        <p className="center">Your Account has been successfully created</p>
        <Link to="/login" className="pill">Login</Link>
      </div>
    </Dark>
  );
}

export function Forgot() {
  const { actions } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const res = actions.startReset(email);
    if (!res.ok) return setError(res.error);
    navigate("/verify");
  };

  return (
    <Dark close="/login">
      <form className="auth-form" onSubmit={submit} noValidate>
        <p className="center">Enter your email and we'll send a verification code.</p>
        <Field id="forgot-email" label="Username" type="email" value={email} onChange={setEmail} placeholder="Email…" autoComplete="username" />
        <FormError>{error}</FormError>
        <button type="submit" className="pill">Send code</button>
      </form>
    </Dark>
  );
}

export function ResetPassword() {
  const { state, actions } = useStore();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState("");

  if (!state.pending?.verified) return <Navigate to="/login" replace />;

  const submit = (e) => {
    e.preventDefault();
    if (pw.length < 8) return setError("Use at least 8 characters.");
    if (pw !== again) return setError("The passwords don't match.");
    actions.finishReset(pw);
    navigate("/login");
  };

  return (
    <Dark>
      <form className="auth-form" onSubmit={submit} noValidate>
        <p className="center">Choose a new password</p>
        <Field id="new-pw" label="Password" type="password" value={pw} onChange={setPw} placeholder="Password…" autoComplete="new-password" />
        <Field id="new-pw2" label="Re-type Password" type="password" value={again} onChange={setAgain} placeholder="Password…" autoComplete="new-password" />
        <FormError>{error}</FormError>
        <button type="submit" className="pill">Confirm</button>
      </form>
    </Dark>
  );
}
