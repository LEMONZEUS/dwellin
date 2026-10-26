# Dwellin

A resident app for apartment and condo buildings: amenity booking, community board, messaging, payments, profile, property FAQs and an AI concierge. This is a React + Vite front end with simulated data. There is no server.

## Run it

You need Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the address Vite prints (usually http://localhost:5173). In VS Code, open this folder and run the commands in the built-in terminal (Ctrl+` or Cmd+`).

Demo login: `demo@dwellin.app` / `dwellin123`. The login screen has a button that fills it in.

## What is included

| Area | Screens |
|---|---|
| Account | Login, register, verification code, account created, forgot password, reset password |
| Home | Welcome Home, upcoming reservations, community board, property |
| Booking | Amenities, schedule (calendar and time slots), review, confirmation |
| Messaging | Message thread with composer, automated acknowledgement |
| Payments | Balance, pay (demo), monthly charges |
| FAQ and AI concierge | Ask a question, cited answer, "That answered it" or "Not quite", escalation to Messaging |
| Profile | Masked account info with Reveal, update password, delete account, menu, terms, privacy |

## Responsive layout

- Under 441px wide: full-screen phone layout with a header and bottom bar.
- 441px to 899px: a wider phone-style column.
- 900px and wider: desktop layout with a sidebar and a wider content area.

The breakpoints are at the top and bottom of `src/styles.css`.

## How data works

Everything is saved in your browser's localStorage under `dwellin-state-v1`. Use "Reset demo data" in the menu (top left) to start over.

- Verification codes are shown on screen because no email is sent.
- Payments move no money.
- Staff replies are not simulated. After you message the community team you get one automated acknowledgement.

## Project layout

```
src/
  App.jsx              routes and login guard
  styles.css           design tokens and all styles
  components/          Shell (frame, header, nav), Ui (fields, modal, calendar), Icons
  screens/             one file per area (Auth, Booking, Home, Messaging, Faq, Account)
  lib/store.jsx        app state and all actions (login, reserve, send message, pay)
  lib/retrieve.js      FAQ matching for the concierge
  lib/messaging.js     sends a message to the community team
  data/                sample FAQ text, building, amenities, notices
```

## Next steps

- **Real backend:** every action lives in `src/lib/store.jsx`. Replace those functions with API calls.
- **Real AI concierge:** `retrieve()` in `src/lib/retrieve.js` matches keywords against `src/data/faqs.js`. Swap it for a call to a language model or search service that returns `{ top, related }` (or `null` for no match) and the UI keeps working. Keep the citation and the escalation path.
- **Your own building:** edit `src/data/seed.js` and `src/data/faqs.js`.
