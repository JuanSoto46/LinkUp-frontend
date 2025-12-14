import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "./lib/firebase";

import Header from "./components/Header";
import Footer from "./components/Footer";
import DashboardLayout from "./layouts/DashboardLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import CreateMeeting from "./pages/CreateMeeting";
import Profile from "./pages/Profile";
import Meetings from "./pages/Meetings";
import Call from "./pages/Call";
import JoinMeeting from "./pages/JoinMeeting";
import UserManual from "./pages/UserManual";


import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import ChangePassword from "./pages/auth/ChangePassword";

// 🔹 NUEVO: contexto y mini llamada
import { CallUiProvider } from "./context/CallUiContext";
import { MiniCall } from "./components/MiniCall";


/**
 * Simple auth gate for protected routes.
 *
 * Wraps children and only renders them if there is
 * an authenticated Firebase user. Otherwise redirects
 * to the login page.
 */
function RequireAuth({ children }: { children: JSX.Element }) {
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-slate-200">
        <div className="animate-pulse text-sm">Cargando sesión...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" replace />;

  return children;
}

/**
 * Default application layout used for all routes
 * except the full-screen call experience.
 *
 * Includes:
 * - Global header
 * - Main content container with max width
 * - Global footer
 */
function MainAppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <Header />

      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/manual-usuario" element={<UserManual />} />

            {/* Auth */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/reset" element={<ResetPassword />} />
            <Route
              path="/auth/change-password"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <ChangePassword />
                  </DashboardLayout>
                </RequireAuth>
              }
            />

            {/* Protected dashboard pages */}
            <Route
              path="/meetings"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <Meetings />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/create-meeting"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <CreateMeeting />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/join-meeting"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <JoinMeeting />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </RequireAuth>
              }
            />

            {/* Fallback inside main layout */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/**
 * Root application component.
 *
 * It:
 * - Sets up the router
 * - Provides a global skip-link for accessibility
 * - Splits the app into:
 *   - A full-screen call route (`/call`)
 *   - The standard layout for the rest of the pages
 */
export default function App() {
  return (
    <CallUiProvider>
      <BrowserRouter>
        {/* Global skip link for accessibility */}
        <a href="#main" className="skip-link">
          Saltar al contenido principal
        </a>

        <Routes>
          {/*  Full-screen call: no Header, no Footer, no max-width container */}
          <Route
            path="/call"
            element={
              <RequireAuth>
                <Call />
              </RequireAuth>
            }
          />

          {/* Everything else uses the standard layout */}
          <Route path="/*" element={<MainAppLayout />} />
        </Routes>

        {/* Mini ventana flotante de llamada en curso */}
        <MiniCall />
      </BrowserRouter>
    </CallUiProvider>
  );
}
