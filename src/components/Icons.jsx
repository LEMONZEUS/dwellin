const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const MenuIcon = (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M4 9h16M4 15h10" /></svg>);
export const ChatIcon = (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M4 5h16v11H11l-4 3.5V16H4z" /><path d="M8 9h8M8 12h5" /></svg>);
export const UserIcon = (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" /></svg>);
export const HomeIcon = (p) => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M12 3 2.5 11.5H5V20h5.5v-5.5h3V20H19v-8.5h2.5z" /></svg>);
export const PlusIcon = (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v8M8 12h8" /></svg>);
export const BuildingIcon = (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M3 9.5 12 4l9 5.5H3zM5 11v7M9.5 11v7M14.5 11v7M19 11v7M3 20h18" /></svg>);
export const BackIcon = (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>);
export const CloseIcon = (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M5 5l14 14M19 5 5 19" /></svg>);
export const SendIcon = (p) => (<svg viewBox="0 0 24 24" {...base} strokeWidth={2} {...p}><path d="M12 19V5M6 11l6-6 6 6" /></svg>);
export const CalendarIcon = (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><rect x="4" y="5.5" width="16" height="14" rx="2" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></svg>);
export const DollarIcon = (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 3v18M16.5 7.5C15.8 6.4 14.2 5.8 12 5.8c-2.4 0-4 1.1-4 2.9 0 4 8.5 2 8.5 6.2 0 1.9-1.8 3.2-4.5 3.2-2.4 0-4.1-.8-4.8-2.3" /></svg>);
export const DocIcon = (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M6 3.5h8l4 4v13H6z" /><path d="M14 3.5v4h4M9 12h6M9 15.5h6" /></svg>);
export const LockIcon = (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><rect x="5.5" y="10.5" width="13" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></svg>);
export const HelpIcon = (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M9.7 9.6a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1.1.9-1.1 1.7M12 16.6v.1" /></svg>);

// Layered skyline used at the bottom of the navy auth screens.
export function Skyline() {
  return (
    <svg className="skyline" viewBox="0 0 390 240" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#35507A" stopOpacity="0.9" />
          <stop offset="1" stopColor="#0A1220" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path d="M195 6 L395 240 L-5 240 Z" fill="url(#sk)" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} d={`M195 ${6 + i * 22} L${395 - i * 22} 240 M195 ${6 + i * 22} L${-5 + i * 22} 240`} stroke="#35507A" strokeOpacity={0.55 - i * 0.05} strokeWidth="1" fill="none" />
      ))}
      <path d="M195 6 L195 240" stroke="#0A1220" strokeWidth="2" />
    </svg>
  );
}
