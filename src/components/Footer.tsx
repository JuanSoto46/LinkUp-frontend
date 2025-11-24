import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";

/**
 * Footer component with sitemap and information
 * Implements usability heuristic: Help and documentation
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const displayName =
    user?.displayName || user?.email || "Usuario";

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Project info */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">LinkUp</h3>
            <p className="text-gray-300 text-sm">
              Prototipo educativo de plataforma de videoconferencia
              para el Sprint 1, enfocado en gestión de usuarios,
              reuniones y diseño responsivo.
            </p>
            {user && (
              <p className="text-xs text-gray-400 mt-3">
                Sesión iniciada como:{" "}
                <span className="text-gray-100">
                  {displayName}
                </span>
              </p>
            )}
          </div>

          {/* Sitemap */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">
              Mapa del sitio
            </h4>
            <ul className="space-y-2 text-sm">
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
                  to="/create-meeting"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  Crear reunión
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
                  Perfil
                </Link>
              </li>
            </ul>
          </div>

          {/* Authentication links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Cuenta</h4>
            <ul className="space-y-2 text-sm">
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
          <div>
            <h4 className="font-semibold mb-4 text-lg">Contacto</h4>
            <address className="text-sm text-gray-300 not-italic">
              <p className="mb-2">
                Correo: equipo@linkup.ejemplo
              </p>
              <p>Soporte académico en horario de clase.</p>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-300 text-sm">
            © {currentYear} LinkUp. Prototipo educativo de
            plataforma de videoconferencia · Sprint 1.
          </p>
        </div>
      </div>
    </footer>
  );
}
