import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { BUILDING } from "../data/seed";
import {
  BackIcon, BuildingIcon, ChatIcon, DocIcon, DollarIcon, HelpIcon, HomeIcon, MenuIcon, PlusIcon, UserIcon, Skyline,
} from "./Icons";

// Outer frame. Under 900px it is a phone-style column; at 900px and wider it fills the window
// and Shell shows a sidebar instead of the header and bottom bar (see styles.css).
export function Device({ children }) {
  return (
    <div className="stage">
      <div className="device">{children}</div>
    </div>
  );
}

// Bottom bar on small screens.
const NAV = [
  { to: "/home", label: "Home", Icon: HomeIcon, match: ["/home", "/community"] },
  { to: "/amenities", label: "New reservation", Icon: PlusIcon, match: ["/amenities", "/schedule", "/review", "/confirmation"] },
  { to: "/faq", label: "Property FAQ's", Icon: BuildingIcon, match: ["/faq"] },
];

// Sidebar on large screens.
const SIDE = [
  { to: "/home", label: "Home", Icon: HomeIcon, match: ["/home"] },
  { to: "/amenities", label: "Amenities", Icon: PlusIcon, match: ["/amenities", "/schedule", "/review", "/confirmation"] },
  { to: "/community", label: "Community Board", Icon: DocIcon, match: ["/community"] },
  { to: "/messages", label: "Messaging", Icon: ChatIcon, match: ["/messages"], badge: true },
  { to: "/payments", label: "Payments", Icon: DollarIcon, match: ["/payments"] },
  { to: "/faq", label: "Property FAQ's", Icon: HelpIcon, match: ["/faq", "/property"] },
  { to: "/profile", label: "My Profile", Icon: UserIcon, match: ["/profile"] },
];

// Main app screen: navy header, light sheet with a title, bottom navigation (or sidebar on desktop).
export function Shell({ title, back, children, scroll = true }) {
  const { user, actions } = useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <>
      <header className="hdr">
        <Link to="/menu" className="ibtn" aria-label="Menu">
          <MenuIcon />
        </Link>
        <div className="hdr-right">
          <Link to="/messages" className="ibtn" aria-label={user?.unread ? "Messaging, new reply" : "Messaging"}>
            <ChatIcon />
            {user?.unread && <span className="badge" />}
          </Link>
          <Link to="/profile" className="ibtn" aria-label="My profile">
            <UserIcon />
          </Link>
        </div>
      </header>

      <aside className="side" aria-label="Sidebar">
        <div className="side-brand">
          Dwellin
          <span>{BUILDING.name}</span>
        </div>
        <nav className="side-nav" aria-label="Primary">
          {SIDE.map(({ to, label, Icon, match, badge }) => {
            const on = match.some((m) => pathname.startsWith(m));
            return (
              <NavLink key={to} to={to} className={on ? "side-link on" : "side-link"} aria-current={on ? "page" : undefined}>
                <Icon />
                <span>{label}</span>
                {badge && user?.unread && <span className="side-dot" aria-label="New reply" />}
              </NavLink>
            );
          })}
        </nav>
        <button type="button" className="side-logout" onClick={() => { actions.logout(); navigate("/login"); }}>
          Logout
        </button>
      </aside>

      <main className="sheet">
        <div className="sheet-top">
          <h1>{title}</h1>
          {back && (
            <button type="button" className="back" onClick={() => navigate(back === true ? -1 : back)} aria-label="Go back">
              <BackIcon />
            </button>
          )}
        </div>
        <div className={scroll ? "scroll" : "scroll noscroll"}>{children}</div>
      </main>

      <nav className="nav" aria-label="Main">
        {NAV.map(({ to, label, Icon, match }) => {
          const on = match.some((m) => pathname.startsWith(m));
          return (
            <NavLink key={to} to={to} className={on ? "ibtn on" : "ibtn"} aria-label={label} aria-current={on ? "page" : undefined}>
              <Icon />
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}

// Full-screen navy layout used for login, registration and the account screens.
export function Dark({ children, close, title, className = "" }) {
  const navigate = useNavigate();
  return (
    <div className={`dark ${className}`}>
      {/* Background photo for the navy screens. Set --auth-image in styles.css to use one. */}
      <div className="dark-photo" aria-hidden="true" />
      {close && (
        <button type="button" className="ibtn dark-close" onClick={() => navigate(close === true ? -1 : close)} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
            <path d="M5 5l14 14M19 5 5 19" />
          </svg>
        </button>
      )}
      {title && <h1 className="dark-title">{title}</h1>}
      <div className="dark-body">{children}</div>
      <Skyline />
    </div>
  );
}
