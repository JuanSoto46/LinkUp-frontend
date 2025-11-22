import { Link } from "react-router-dom";

/**
 * About page with company information and mission
 * Implements usability heuristic: Match between system and real world
 */
export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-blue-400 font-medium">CONÓCENOS</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Sobre <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">LinkUp</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Revolucionando la forma en que los equipos se conectan y colaboran a través 
          de videoconferencias intuitivas y seguras.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl">
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nuestra Misión</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Democratizar el acceso a herramientas de comunicación de calidad, 
            permitiendo que equipos de todos los tamaños se conecten sin barreras 
            técnicas ni económicas.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl">
          <div className="text-3xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nuestra Visión</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Ser la plataforma de referencia para colaboración remota, integrando 
            inteligencia artificial y experiencias inmersivas que transformen 
            la forma de trabajar en equipo.
          </p>
        </div>
      </section>

      {/* Project Information */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Prototipo Educativo - Sprint 1
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🎓 Contexto del Proyecto
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Este es un prototipo educativo desarrollado como parte del Sprint 1, 
              enfocado en la gestión de usuarios y la interfaz gráfica de una 
              plataforma de videoconferencias.
            </p>
            <ul className="text-gray-600 dark:text-gray-300 space-y-2">
              <li>✅ Gestión completa de usuarios</li>
              <li>✅ Autenticación múltiple</li>
              <li>✅ Interfaz responsive</li>
              <li>✅ Experiencia moderna</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🔧 Tecnologías Implementadas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "React", color: "blue" },
                { name: "TypeScript", color: "blue" },
                { name: "Tailwind CSS", color: "green" },
                { name: "Firebase", color: "orange" },
                { name: "Node.js", color: "green" },
                { name: "Express", color: "gray" }
              ].map((tech, index) => (
                <span 
                  key={index}
                  className={`px-3 py-2 rounded-lg text-center text-sm font-medium
                    ${tech.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                    ${tech.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                    ${tech.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : ''}
                    ${tech.color === 'gray' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : ''}
                  `}
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Características Destacadas
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "👥",
              title: "Gestión de Usuarios",
              description: "Registro, autenticación y perfiles completos"
            },
            {
              icon: "🎨",
              title: "Diseño Moderno",
              description: "Interfaz intuitiva con modo claro/oscuro"
            },
            {
              icon: "📱",
              title: "Totalmente Responsive",
              description: "Experiencia optimizada para todos los dispositivos"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Listo para probar LinkUp?
          </h2>
          <p className="text-blue-100 text-lg mb-6">
            Explora todas las funcionalidades de nuestro prototipo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              <span>Crear Cuenta</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              <span>Explorar Demo</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}