import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Device } from "./components/Shell";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { StoreProvider, useStore } from "./lib/store";
import { AccountCreated, Forgot, Login, Register, ResetPassword, Verify } from "./screens/Auth";
import { Amenities, Confirmation, Review, Schedule } from "./screens/Booking";
import { Community, Home } from "./screens/Home";
import { Messages, Payments } from "./screens/Messaging";
import { Faq } from "./screens/Faq";
import { DeleteAccount, Legal, Menu, Profile } from "./screens/Account";

function Private({ children }) {
  const { user } = useStore();
  const { pathname } = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: pathname }} />;
  return children;
}

const p = (el) => <Private>{el}</Private>;

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Device>
          <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/account-created" element={<AccountCreated />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset" element={<ResetPassword />} />

            <Route path="/home" element={p(<Home />)} />
            <Route path="/amenities" element={p(<Amenities />)} />
            <Route path="/schedule/:id" element={p(<Schedule />)} />
            <Route path="/review" element={p(<Review />)} />
            <Route path="/confirmation" element={p(<Confirmation />)} />
            <Route path="/community" element={p(<Community />)} />
            <Route path="/messages" element={p(<Messages />)} />
            <Route path="/payments" element={p(<Payments />)} />
            <Route path="/property" element={<Navigate to="/faq" replace />} />
            <Route path="/faq" element={p(<Faq />)} />
            <Route path="/profile" element={p(<Profile />)} />
            <Route path="/delete" element={p(<DeleteAccount />)} />
            <Route path="/menu" element={p(<Menu />)} />
            <Route path="/terms" element={p(<Legal kind="terms" />)} />
            <Route path="/privacy" element={p(<Legal kind="privacy" />)} />

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
          </ErrorBoundary>
        </Device>
      </HashRouter>
    </StoreProvider>
  );
}
