import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEMO_USER } from "../data/seed";
import { nowStamp } from "./dates";

// All app state lives in the browser (localStorage). There is no server.
// To connect a real backend later, replace the functions in `actions` with API calls.

const KEY = "dwellin-state-v1";
const Ctx = createContext(null);

const blankProfile = () => ({ reservations: [], messages: [], balance: 3173, paid: [] });

function initial() {
  const fresh = {
    users: [{ ...DEMO_USER, ...blankProfile() }],
    session: null,
    pending: null,
  };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh, ...JSON.parse(raw) };
  } catch {
    /* storage can be unavailable; fall back to fresh state */
  }
  return fresh;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const makeCode = () => String(Math.floor(100000 + Math.random() * 900000));

export function StoreProvider({ children }) {
  const [state, setState] = useState(initial);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const user = state.users.find((u) => u.email === state.session) || null;

  const patchUser = useCallback((fn) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.email === s.session ? { ...u, ...fn(u) } : u)),
    }));
  }, []);

  const actions = useMemo(
    () => ({
      // ---- auth ----
      login(email, password) {
        const u = state.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
        if (!u || u.password !== password) return { ok: false, error: "That email and password don't match." };
        setState((s) => ({ ...s, session: u.email }));
        return { ok: true };
      },
      logout() {
        setState((s) => ({ ...s, session: null }));
      },
      startRegister({ name, email, password }) {
        const clean = email.trim().toLowerCase();
        if (state.users.some((u) => u.email.toLowerCase() === clean))
          return { ok: false, error: "An account with that email already exists." };
        const code = makeCode();
        setState((s) => ({ ...s, pending: { kind: "register", name: name.trim(), email: clean, password, code } }));
        return { ok: true };
      },
      startReset(email) {
        const clean = email.trim().toLowerCase();
        if (!state.users.some((u) => u.email.toLowerCase() === clean))
          return { ok: false, error: "We couldn't find an account with that email." };
        const code = makeCode();
        setState((s) => ({ ...s, pending: { kind: "reset", email: clean, code } }));
        return { ok: true };
      },
      verify(code) {
        const p = state.pending;
        if (!p) return { ok: false, error: "Start again from the login screen." };
        if (code.trim() !== p.code) return { ok: false, error: "That code doesn't match. Check it and try again." };
        if (p.kind === "register") {
          setState((s) => ({
            ...s,
            pending: null,
            users: [
              ...s.users,
              { name: p.name, email: p.email, password: p.password, unit: "", phone: "", contactEmail: p.email, ...blankProfile(), balance: 0 },
            ],
          }));
          return { ok: true, kind: "register" };
        }
        setState((s) => ({ ...s, pending: { ...p, verified: true } }));
        return { ok: true, kind: "reset" };
      },
      finishReset(password) {
        const p = state.pending;
        if (!p || !p.verified) return { ok: false };
        setState((s) => ({
          ...s,
          pending: null,
          users: s.users.map((u) => (u.email === p.email ? { ...u, password } : u)),
        }));
        return { ok: true };
      },
      updatePassword(current, next) {
        if (!user || user.password !== current) return { ok: false, error: "Your current password is incorrect." };
        patchUser(() => ({ password: next }));
        return { ok: true };
      },
      updateProfile(fields) {
        patchUser(() => fields);
      },
      deleteAccount() {
        setState((s) => ({ ...s, users: s.users.filter((u) => u.email !== s.session), session: null }));
      },

      // ---- reservations ----
      reserve(res) {
        const entry = { id: uid(), createdAt: nowStamp(), ...res };
        patchUser((u) => ({ reservations: [...u.reservations, entry] }));
        return entry;
      },
      cancelReservation(id) {
        patchUser((u) => ({ reservations: u.reservations.filter((r) => r.id !== id) }));
      },

      // ---- messaging ----
      sendMessage(text, attachment = null) {
        const msg = { id: uid(), from: "resident", text, at: nowStamp(), attachment };
        patchUser((u) => ({ messages: [...u.messages, msg], unread: false }));
        return msg;
      },
      addTeamReply(text) {
        patchUser((u) => ({
          messages: [...u.messages, { id: uid(), from: "team", text, at: nowStamp(), automated: true }],
          unread: true,
        }));
      },
      markRead() {
        patchUser(() => ({ unread: false }));
      },

      // ---- payments ----
      pay(amount) {
        patchUser((u) => ({
          balance: Math.max(0, u.balance - amount),
          paid: [{ id: uid(), amount, at: nowStamp() }, ...u.paid],
        }));
      },

      resetDemo() {
        try {
          localStorage.removeItem(KEY);
        } catch {
          /* ignore */
        }
        window.location.reload();
      },
    }),
    [state.users, state.pending, user, patchUser]
  );

  return <Ctx.Provider value={{ state, user, actions }}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
