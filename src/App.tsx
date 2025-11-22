import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, logout } from "./lib/firebase";

import Home from "./pages/Home";
import About from "./pages/About";
import Explore from "./pages/Explore";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./pages/Profile";
import CreateMeeting from "./pages/CreateMeeting";

function Header() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const isAuthRoute = location.pathname.startsWith("/auth");

  let links: { to: string; label: string }[] = [];

  if (isAuthRoute) {
    // En pantallas de auth solo estos
    links = [
      { to: "/about", label: "Sobre LinkUp" },
      { to: "/auth/login", label: "Iniciar sesión" },
      { to: "/auth/register", label: "Crear cuenta" },
    ];
  } else if (user) {
    // Usuario logueado: acceso a todo
    links = [
      { to: "/", label: "Inicio" },
      { to: "/about", label: "Sobre LinkUp" },
      { to: "/explore", label: "Explorar" },
      { to: "/create-meeting", label: "Crear reunión" },
      { to: "/profile", label: "Mi perfil" },
    ];
  } else {
    // No logueado (pero fuera de /auth): solo lo básico
    links = [
      { to: "/", label: "Inicio" },
      { to: "/about", label: "Sobre LinkUp" },
      { to: "/explore", label: "Explorar" },
    ];
  }

  const showLoginButton = !user && !isAuthRoute;
  const showLogoutButton = !!user && !isAuthRoute;

  async function handleLogout() {
    await logout();
    navigate("/auth/login");
    setMenuOpen(false);
  }

  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <nav className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-sky-500 grid place-items-center text-xs font-bold">
            LU
          </div>
          <span className="font-semibold tracking-tight">LinkUp</span>
        </div>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6 text-sm">
          {links.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="hover:text-sky-400"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-3">
          {showLoginButton && (
            <Link
              to="/auth/login"
              className="text-sm px-4 py-2 rounded-lg border border-slate-700 hover:border-sky-500"
            >
              Iniciar sesión
            </Link>
          )}

          {showLogoutButton && (
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400"
            >
              Cerrar sesión
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden inline-flex flex-col justify-center items-center w-9 h-9 rounded-lg border border-slate-700"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          <span className="block w-5 h-0.5 bg-slate-100 mb-1" />
          <span className="block w-5 h-0.5 bg-slate-100 mb-1" />
          <span className="block w-5 h-0.5 bg-slate-100" />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-3 text-sm">
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="hover:text-sky-400"
              >
                {item.label}
              </Link>
            ))}

            {showLoginButton && (
              <Link
                to="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex justify-center rounded-lg border border-slate-700 px-4 py-2 hover:border-sky-500"
              >
                Iniciar sesión
              </Link>
            )}

            {showLogoutButton && (
              <button
                onClick={handleLogout}
                className="mt-2 inline-flex justify-center rounded-lg bg-sky-500 px-4 py-2 text-slate-950 hover:bg-sky-400"
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

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
        <a href="#main" className="skip-link">
          Saltar al contenido principal
        </a>

        <Header />

        <main id="main" className="flex-1">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/reset" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/create-meeting" element={<CreateMeeting />} />
            </Routes>
          </div>
        </main>

        <footer className="border-t border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-6xl px-6 py-8 grid gap-6 md:grid-cols-3 text-sm text-slate-400">
            <section>
              <h3 className="font-semibold mb-2">LinkUp</h3>
              <p>
                Prototipo educativo de plataforma de videoconferencia
                desarrollado en el Sprint 1.
              </p>
            </section>
            <section>
              <h3 className="font-semibold mb-2">Mapa del sitio</h3>
              <ul className="space-y-1">
                <li>
                  <Link to="/" className="hover:text-sky-400">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-sky-400">
                    Sobre LinkUp
                  </Link>
                </li>
                <li>
                  <Link to="/explore" className="hover:text-sky-400">
                    Explorar
                  </Link>
                </li>
                <li>
                  <Link
                    to="/create-meeting"
                    className="hover:text-sky-400"
                  >
                    Crear reunión
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-sky-400">
                    Perfil
                  </Link>
                </li>
                <li>
                  <Link to="/auth/login" className="hover:text-sky-400">
                    Iniciar sesión
                  </Link>
                </li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold mb-2">Usabilidad</h3>
              <p>
                Se aplican heurísticas de visibilidad del estado del
                sistema y control del usuario, y una pauta WCAG operable
                (navegación por teclado y foco visible).
              </p>
            </section>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
