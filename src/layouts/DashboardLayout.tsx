import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, logout } from "../lib/firebase";

/**
 * Authenticated dashboard layout with left sidebar navigation.
 * Used for internal pages after login.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(auth.currentUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) navigate("/auth/login");
    });
    return unsubscribe;
  }, [navigate]);

  // 🔹 Close mobile menu automatically on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { to: "/meetings", label: "Mis reuniones" },
    { to: "/profile", label: "Mi perfil" },
    { to: "/auth/change-password", label: "Cambiar contraseña" },
    { to: "/user-manual", label: "Manual de usuario" },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
      {/* Mobile header: only hamburger button, no duplicated logo */}
      <div className="md:hidden mb-2">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 grid place-items-center border border-slate-700 text-slate-100"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar (desktop only) */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col rounded-2xl border border-slate-800 bg-[#050816] p-5 h-[calc(100vh-8rem)] sticky top-24">
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition ${
                  active
                    ? "bg-sky-600 text-white"
                    : "text-slate-200 hover:bg-slate-900"
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => navigate("/about")}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-slate-900 transition"
            >
              Sobre nosotros
            </button>
          </div>
        </nav>

        {/* User & logout (desktop) */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          {user && (
            <p className="text-xs text-slate-400 leading-snug">
              Sesión iniciada como{" "}
              <span className="text-slate-100">
                {user.email || user.displayName || "Usuario"}
              </span>
            </p>
          )}
          <button
            onClick={logout}
            className="w-full px-4 py-2 rounded-xl border border-red-500/70 text-xs text-red-200 hover:bg-red-500/10 transition text-left"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <section className="flex-1 min-w-0">{children}</section>

      {/* Mobile drawer menu - only on small screens */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Left drawer */}
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80%] bg-[#050816] border-r border-slate-800 p-4 flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-50">
                  Menú del panel
                </span>
                <span className="text-[11px] text-slate-400">
                  Navega por tus secciones
                </span>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 grid place-items-center border border-slate-700 text-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Main links */}
            <nav className="space-y-3 mb-4">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const active = location.pathname === item.to;
                  return (
                    <button
                      key={item.to}
                      onClick={() => {
                        navigate(item.to);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-full text-sm transition border ${
                        active
                          ? "bg-sky-600 text-white border-transparent shadow-sm"
                          : "bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  navigate("/about");
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-full text-sm transition border ${
                  location.pathname === "/about"
                    ? "bg-slate-700 text-slate-50 border-slate-600"
                    : "bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800"
                }`}
              >
                Sobre nosotros
              </button>
            </nav>

            {/* User info & logout (mobile) */}
            <div className="mt-auto pt-4 border-t border-slate-800 space-y-3 text-[11px] text-slate-400">
              {user && (
                <p className="leading-snug">
                  Sesión iniciada como{" "}
                  <span className="text-slate-100">
                    {user.email || user.displayName || "Usuario"}
                  </span>
                </p>
              )}

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 rounded-xl border border-red-500/70 text-[11px] text-red-200 hover:bg-red-500/10 transition text-left"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
