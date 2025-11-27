import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { useLocation } from "react-router-dom";

/**
 * Footer component with sitemap and information.
 * Implements usability heuristic: Help and documentation.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [user, setUser] = useState(auth.currentUser);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const displayName = user?.displayName || user?.email || "Usuario";

  // No footer in call page
  if (location.pathname === "/call") {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Project info */}
          <div className="md:col-span-1 text-sm">
            <h3 className="text-lg font-bold mb-2">LinkUp</h3>
            <p className="text-gray-300 text-xs leading-relaxed">
              Prototipo educativo de plataforma de videoconferencia, centrado en gestión de usuarios,
              reuniones y diseño responsivo.
            </p>
            {user && (
              <p className="text-[11px] text-gray-400 mt-3">
                Sesión iniciada como:{" "}
                <span className="text-gray-100">
                  {displayName}
                </span>
              </p>
            )}
          </div>

          {/* Sitemap (compact) */}
          <div className="text-xs">
            <h4 className="font-semibold mb-2 text-sm">
              Mapa del sitio
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link
                  to="/meetings"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  Mis reuniones
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  Perfil de usuario
                </Link>
              </li>
            </ul>
          </div>

          {/* Authentication links (compact) */}
          <div className="text-xs">
            <h4 className="font-semibold mb-2 text-sm">Cuenta</h4>
            <ul className="space-y-1.5">
              <li>
                <Link
                  to="/auth/login"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/register"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  Crear cuenta
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/reset"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  Recuperar contraseña
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="text-xs">
            <h4 className="font-semibold mb-2 text-sm">Contacto</h4>
            <address className="text-gray-300 not-italic space-y-1.5">
              <p>Correo: equipo@linkup.ejemplo</p>
              <p>Soporte académico en horario de clase.</p>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-6 pt-4 text-center">
          <p className="text-gray-400 text-[11px]">
            © {currentYear} LinkUp. Prototipo educativo de
            plataforma de videoconferencia · Sprint 2.
          </p>
        </div>
      </div>
    </footer>
  );
}
