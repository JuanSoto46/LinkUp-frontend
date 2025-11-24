import { Link, useLocation } from "react-router-dom";
import { auth, logout } from "../lib/firebase";
import { useEffect, useState } from "react";

/**
 * Header component with navigation and user auth state
 * Implements usability heuristic: Visibility of system status
 */
export default function Header() {
  const [user, setUser] = useState(auth.currentUser);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const isAuthRoute = location.pathname.startsWith("/auth");
  const isActive = (path: string) => location.pathname === path;

  const displayName =
    user?.displayName || user?.email || "Usuario";

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 px-2 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="w-9 h-9 rounded-full bg-emerald-400 grid place-items-center text-slate-950 font-black">
            L
          </div>
          <span className="font-bold tracking-wide text-slate-50">
            LinkUp
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-200">
          {!isAuthRoute && (
            <>
              <Link
                to="/"
                className={`hover:text-sky-400 ${
                  isActive("/") ? "text-sky-400" : ""
                }`}
              >
                Inicio
              </Link>

              <Link
                to="/about"
                className={`hover:text-sky-400 ${
                  isActive("/about") ? "text-sky-400" : ""
                }`}
              >
                Sobre nosotros
              </Link>

              {user && (
                <Link
                  to="/meetings"
                  className={`hover:text-sky-400 ${
                    isActive("/meetings") ? "text-sky-400" : ""
                  }`}
                >
                  Panel principal
                </Link>
              )}
            </>
          )}

          {!user ? (
            !isAuthRoute && (
              <>
                <Link
                  to="/auth/login"
                  className="text-sm font-semibold px-5 py-2 rounded-full border border-slate-600 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/auth/register"
                  className="text-sm font-semibold px-5 py-2 rounded-full bg-sky-600 hover:bg-sky-500 text-slate-50 shadow focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Crear cuenta
                </Link>
              </>
            )
          ) : (
            <>
              {/* Sesión iniciada - desktop */}
              <div className="hidden lg:flex flex-col items-end text-xs text-slate-300 max-w-[220px]">
                <span>Sesión iniciada como</span>
                <span className="text-slate-50 truncate">
                  {displayName}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-sm font-semibold px-5 py-2 rounded-full border border-red-500/70 text-red-200 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className="block w-5 h-0.5 bg-slate-100 mb-1.5" />
          <span className="block w-5 h-0.5 bg-slate-100 mb-1.5" />
          <span className="block w-5 h-0.5 bg-slate-100" />
        </button>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-3 text-sm">
            {!isAuthRoute && (
              <>
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-2 py-1 rounded-lg ${
                    isActive("/")
                      ? "text-sky-400"
                      : "hover:text-sky-400"
                  }`}
                >
                  Inicio
                </Link>

                <Link
                  to="/about"
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-2 py-1 rounded-lg ${
                    isActive("/about")
                      ? "text-sky-400"
                      : "hover:text-sky-400"
                  }`}
                >
                  Sobre nosotros
                </Link>

                {user && (
                  <Link
                    to="/meetings"
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-2 py-1 rounded-lg ${
                      isActive("/meetings")
                        ? "text-sky-400"
                        : "hover:text-sky-400"
                    }`}
                  >
                    Panel principal
                  </Link>
                )}
              </>
            )}

            {user ? (
              <>
                {/* Sesión iniciada - mobile */}
                <p className="text-xs text-slate-300 mt-2">
                  Sesión iniciada como{" "}
                  <span className="text-slate-50">
                    {displayName}
                  </span>
                </p>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="mt-1 px-4 py-2 rounded-xl border border-red-500/70 text-red-200 hover:bg-red-500/10 text-left"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              !isAuthRoute && (
                <>
                  <Link
                    to="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-900 text-center"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-slate-50 text-center"
                  >
                    Crear cuenta
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
