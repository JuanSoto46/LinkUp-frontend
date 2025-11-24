import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, logout } from "../lib/firebase";

/**
 * Authenticated dashboard layout with left sidebar navigation.
 * Used for internal pages after login.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(auth.currentUser);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) navigate("/auth/login");
    });
    return unsubscribe;
  }, [navigate]);

  const navItems = [
    { to: "/meetings", label: "Mis reuniones" },
    { to: "/profile", label: "Mi perfil" },
    { to: "/auth/change-password", label: "Cambiar contraseña" },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
      {/* Navegación superior en móvil */}
      <div className="md:hidden mb-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`px-4 py-2 rounded-full text-xs whitespace-nowrap border transition ${
                  active
                    ? "bg-sky-600 border-sky-500 text-white"
                    : "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Accesos rápidos adicionales */}
          <button
            onClick={() => navigate("/call")}
            className={`px-4 py-2 rounded-full text-xs whitespace-nowrap border transition ${
              location.pathname === "/call"
                ? "bg-emerald-500 border-emerald-400 text-slate-950 font-semibold"
                : "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
            }`}
          >
            Llamada (demo)
          </button>

          <button
            onClick={() => navigate("/about")}
            className="px-4 py-2 rounded-full text-xs whitespace-nowrap border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 transition"
          >
            Sobre nosotros
          </button>
        </div>
      </div>

      {/* Sidebar solo en pantallas medianas en adelante */}
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
              onClick={() => navigate("/call")}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition ${
                location.pathname === "/call"
                  ? "bg-emerald-500 text-slate-950 font-semibold"
                  : "text-slate-200 hover:bg-slate-900"
              }`}
            >
              Llamada (demo)
            </button>

            <button
              onClick={() => navigate("/about")}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-slate-900 transition"
            >
              Sobre nosotros
            </button>
          </div>
        </nav>

        {/* User & logout */}
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

      {/* Contenido: se adapta al ancho disponible */}
      <section className="flex-1 min-w-0">
        {children}
      </section>
    </div>
  );
}
