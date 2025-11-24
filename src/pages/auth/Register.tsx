import { FormEvent, useState } from "react";
import { registerEmail } from "../../lib/firebase";
import { api } from "../../lib/api";
import { useNavigate, Link } from "react-router-dom";

/**
 * User registration page
 * Implements usability heuristic: Error prevention with form validation
 */
export default function Register() {
  const [form, setForm] = useState({ 
    firstName: "", 
    lastName: "", 
    age: 18, 
    email: "", 
    password: "" 
  });
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Handle registration form submission
   */
  async function onSubmit(e: FormEvent) {
    e.preventDefault(); 
    setError(null);
    setLoading(true);

    try {
    
      // Register profile in the backend ( Auth & DB info ) NOT REGISTER AUTH HERE 
      const response = await api.registerProfile(form);
      
      if (response.success) {
        setOk(true);
        // Redirect to login after successful registration
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      } else {
        setError(response.error || "Error en el registro");
      }
    } catch (e: any) {
      console.error("Registration error:", e);
      
      // Handle specific error cases
      if (e.message?.includes('already registered') || e.message?.includes('email-already')) {
        setError("Este correo electrónico ya está registrado. Por favor, inicia sesión en su lugar.");
      } else if (e.message?.includes('Email already')) {
        setError("Este correo electrónico ya está en uso. Por favor, usa un correo diferente o inicia sesión.");
      } else if (e.message?.includes('auth/weak-password')) {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setError(e.message || "Error en el registro. Por favor, intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-blue-400 font-medium">CREAR CUENTA</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Únete a LinkUp
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Crea tu cuenta y comienza a conectar
        </p>
      </div>

      {ok && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl" role="alert">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl" role="alert">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          {error.includes("ya") && (
            <div className="mt-2 text-center">
              <Link 
                to="/auth/login" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-sm transition-colors"
              >
                Ir al Inicio de Sesión →
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre
            </label>
            <input
              id="firstName"
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Juan"
              value={form.firstName}
              onChange={e => setForm({...form, firstName: e.target.value})}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Apellido
            </label>
            <input
              id="lastName"
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Pérez"
              value={form.lastName}
              onChange={e => setForm({...form, lastName: e.target.value})}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Edad
          </label>
          <input
            id="age"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            type="number"
            min="1"
            max="120"
            value={form.age}
            onChange={e => setForm({...form, age: Number(e.target.value)})}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Correo Electrónico
          </label>
          <input
            id="email"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            type="email"
            placeholder="juan@ejemplo.com"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contraseña
          </label>
          <input
            id="password"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            required
            minLength={6}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            La contraseña debe tener al menos 6 caracteres
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creando cuenta...</span>
            </>
          ) : (
            <>
              <span>Crear Cuenta</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          ¿Ya tienes una cuenta?{" "}
          <Link 
            to="/auth/login" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
          >
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
