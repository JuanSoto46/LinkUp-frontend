import { Link } from "react-router-dom";
import { auth } from "../lib/firebase";

/**
 * Home page with hero section and visual sitemap
 * Implements usability heuristic: Visibility of system status
 */
export default function Home() {
  const user = auth.currentUser;

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12 md:py-16">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-blue-400 font-medium">PLATAFORMA EDUCATIVA - SPRINT 1</span>
          </div>                

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Conecta, Colabora,{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Crea
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            La plataforma de videoconferencias diseñada para equipos modernos.
            Reuniones fluidas, colaboración en tiempo real y experiencias que conectan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {user ? (
            <>
              <Link
                to="/create-meeting"
                className="group px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>Crear Reunión</span>
                <svg aria-hidden="true" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/explore"
                className="px-6 md:px-8 py-3 md:py-4 border-2 border-gray-300 dark:border-gray-600 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-300 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <span>Explorar Plataforma</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth/register"
                className="group px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>Comenzar Gratis</span>
                <svg aria-hidden="true" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/explore"
                className="px-6 md:px-8 py-3 md:py-4 border-2 border-gray-300 dark:border-gray-600 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-300 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <span>Ver Demo</span>
              </Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-2xl mx-auto pt-8">
          {[
            { number: "99.9%", label: "Tiempo Activo" },
            { number: "HD", label: "Video Calidad" },
            { number: "∞", label: "Reuniones" },
            { number: "24/7", label: "Soporte" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.number}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {[
          {
            icon: "🎯",
            title: "Fácil de Usar",
            description: "Interfaz intuitiva diseñada para que cualquier persona pueda comenzar en minutos."
          },
          {
            icon: "🔒",
            title: "Seguro y Privado",
            description: "Tus reuniones están protegidas con encriptación de última generación."
          },
          {
            icon: "🚀",
            title: "Rendimiento Óptimo",
            description: "Video fluido y audio cristalino incluso con conexiones limitadas."
          }
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      {/* Visual Sitemap */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white">Explora LinkUp</h2>
          <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg">
            Navega fácilmente por todas las funcionalidades de nuestra plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Inicio", href: "/", emoji: "🏠", color: "blue" },
            { label: "Sobre Nosotros", href: "/about", emoji: "👥", color: "purple" },
            { label: "Explorar", href: "/explore", emoji: "🔍", color: "green" },
            { label: "Crear Reunión", href: "/create-meeting", emoji: "🎬", color: "red" },
            { label: "Mi Perfil", href: "/profile", emoji: "👤", color: "yellow" },
            { label: "Iniciar Sesión", href: "/auth/login", emoji: "🔑", color: "indigo" },
            { label: "Registrarse", href: "/auth/register", emoji: "📝", color: "pink" },
            { label: "Recuperar Contraseña", href: "/auth/reset", emoji: "🔄", color: "orange" }
          ].map((item, index) => (
            <Link
              key={item.href}
              to={item.href}
              className={`
                group p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 text-center
                bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm
                ${item.color === 'blue' ? 'border-blue-200 hover:border-blue-500 dark:border-blue-800 dark:hover:border-blue-400' : ''}
                ${item.color === 'purple' ? 'border-purple-200 hover:border-purple-500 dark:border-purple-800 dark:hover:border-purple-400' : ''}
                ${item.color === 'green' ? 'border-green-200 hover:border-green-500 dark:border-green-800 dark:hover:border-green-400' : ''}
                ${item.color === 'red' ? 'border-red-200 hover:border-red-500 dark:border-red-800 dark:hover:border-red-400' : ''}
                ${item.color === 'yellow' ? 'border-yellow-200 hover:border-yellow-500 dark:border-yellow-800 dark:hover:border-yellow-400' : ''}
                ${item.color === 'indigo' ? 'border-indigo-200 hover:border-indigo-500 dark:border-indigo-800 dark:hover:border-indigo-400' : ''}
                ${item.color === 'pink' ? 'border-pink-200 hover:border-pink-500 dark:border-pink-800 dark:hover:border-pink-400' : ''}
                ${item.color === 'orange' ? 'border-orange-200 hover:border-orange-500 dark:border-orange-800 dark:hover:border-orange-400' : ''}
                hover:bg-white dark:hover:bg-gray-600
              `}
            >
              <div className="text-2xl mb-2 transform group-hover:scale-110 transition-transform">
                {item.emoji}
              </div>
              <div className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl p-8 md:p-12 text-center transition-all duration-300 hover:shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-blue-100 text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
            Únete a miles de equipos que ya usan LinkUp para conectar, colaborar y crear juntos.
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span>Crear Cuenta Gratis</span>
            <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </section>
      )}
    </div>
  );
}