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

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import ChangePassword from "./pages/auth/ChangePassword";

/**
 * Simple auth gate for protected routes.
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

export default function App() {
  return (
    <BrowserRouter>
      {/* Skip link for accessibility */}
      <a href="#main" className="skip-link">
        Saltar al contenido principal
      </a>

      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
        <Header />

        <main id="main" className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />

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
                path="/profile"
                element={
                  <RequireAuth>
                    <DashboardLayout>
                      <Profile />
                    </DashboardLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/call"
                element={
                  <RequireAuth>
                    <DashboardLayout>
                      <Call />
                    </DashboardLayout>
                  </RequireAuth>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
