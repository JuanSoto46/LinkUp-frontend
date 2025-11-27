import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth, logout } from "../lib/firebase";
import { useEffect, useState } from "react";

/**
 * Main application header component.
 *
 * It:
 * - Shows the brand logo
 * - Adapts to auth state (public vs dashboard)
 * - Hides itself on the /call full-screen layout
 * - Provides a responsive mobile navigation with a hamburger button
 */
export default function Header() {
  const [user, setUser] = useState(auth.currentUser);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const isAuthRoute = location.pathname.startsWith("/auth");
  const isCallRoute = location.pathname === "/call";
  const isActive = (path: string) => location.pathname === path;

  const displayName = user?.displayName || user?.email || "Usuario";

  /**
   * Rules:
   * - Without user: full header (nav, buttons, etc.).
   * - With user in normal routes: compact header in desktop (only logo).
   * - In call route: logo + own Call header, no extra menu.
   */
  const isCompactHeader = !!user && !isCallRoute;
  const isCallHeader = !!user && isCallRoute;

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  const hamburgerLineBase =
    "block w-5 h-0.5 rounded-full bg-slate-100 transition-transform transition-opacity duration-200";

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <nav
        className="
          max-w-6xl mx-auto px-4 py-3
          flex items-center justify-between
          gap-4 sm:gap-6
        "
      >
        {/* Logo */}
        <Link
          to={user ? "/meetings" : "/"}
          className="flex items-center gap-2 px-2 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 shrink-0"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="w-9 h-9 rounded-full bg-emerald-400 grid place-items-center text-slate-950 font-black">
            L
          </div>
          <span className="font-bold tracking-wide text-slate-50">
            LinkUp
          </span>
        </Link>

        {/* Desktop nav: only when not compact and not /call */}
        {!isCompactHeader && !isCallHeader && (
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-200 ml-auto">
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
                {/* Logged user info - desktop (only when not compact) */}
                <div className="hidden lg:flex flex-col items-end text-xs text-slate-300 max-w-[220px]">
                  <span>Sesión iniciada como</span>
                  <span className="text-slate-50 truncate">
                    {displayName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold px-5 py-2 rounded-full border border-red-500/70 text-red-200 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        )}

        {/* Mobile hamburger button: always on mobile, except on /call */}
        {!isCallHeader && (
          <button
            className="
              md:hidden inline-flex items-center justify-center
              w-10 h-10 rounded-full
              border border-slate-700
              bg-slate-900/70
              hover:bg-slate-900
              text-slate-200
              focus:outline-none focus:ring-2 focus:ring-sky-500
              ml-auto
            "
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            <span
              className={`${hamburgerLineBase} ${
                isMenuOpen ? "translate-y-1.5 rotate-45" : ""
              }`}
            />
            <span
              className={`${hamburgerLineBase} ${
                isMenuOpen ? "opacity-0" : "mt-1.5 mb-1.5"
              }`}
            />
            <span
              className={`${hamburgerLineBase} ${
                isMenuOpen ? "-translate-y-1.5 -rotate-45" : ""
              }`}
            />
          </button>
        )}
      </nav>

      {/* Mobile menu */}
      {!isCallHeader && isMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-3 text-sm">
            {!isAuthRoute && (
              <>
                {user ? (
                  <>
                    {/* Dashboard-like mobile menu when user is logged in */}
                    <button
                      onClick={() => {
                        navigate("/meetings");
                        setIsMenuOpen(false);
                      }}
                      className={`px-2 py-1 rounded-lg text-left ${
                        isActive("/meetings")
                          ? "text-sky-400"
                          : "hover:text-sky-400"
                      }`}
                    >
                      Mis reuniones
                    </button>
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setIsMenuOpen(false);
                      }}
                      className={`px-2 py-1 rounded-lg text-left ${
                        isActive("/profile")
                          ? "text-sky-400"
                          : "hover:text-sky-400"
                      }`}
                    >
                      Mi perfil
                    </button>
                    <button
                      onClick={() => {
                        navigate("/auth/change-password");
                        setIsMenuOpen(false);
                      }}
                      className={`px-2 py-1 rounded-lg text-left ${
                        isActive("/auth/change-password")
                          ? "text-sky-400"
                          : "hover:text-sky-400"
                      }`}
                    >
                      Cambiar contraseña
                    </button>
                    <button
                      onClick={() => {
                        navigate("/about");
                        setIsMenuOpen(false);
                      }}
                      className={`px-2 py-1 rounded-lg text-left ${
                        isActive("/about")
                          ? "text-sky-400"
                          : "hover:text-sky-400"
                      }`}
                    >
                      Sobre nosotros
                    </button>
                  </>
                ) : (
                  <>
                    {/* Public menu when user is not logged in */}
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
                  </>
                )}
              </>
            )}

            {!user && !isAuthRoute && (
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
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="mt-2 px-4 py-2 rounded-xl border border-red-500/70 text-red-200 hover:bg-red-500/10 text-center text-sm"
              >
                Cerrar sesión
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
