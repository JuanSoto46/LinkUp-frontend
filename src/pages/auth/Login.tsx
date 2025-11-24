import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  loginEmail,
  loginGoogle,
  loginGithub
} from "../../lib/firebase";
import { api } from "../../lib/api";

/**
 * Login screen: email + providers.
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoadingEmail(true);
    setError(null);

    try {
      await loginEmail(email, password);
      navigate("/meetings");
    } catch (err: any) {
      let msg = "No se pudo iniciar sesión.";
      if (
        err?.code === "auth/user-not-found" ||
        err?.code === "auth/wrong-password"
      ) {
        msg = "Correo o contraseña incorrectos.";
      }
      setError(msg);
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      const login = await loginGoogle();
      const {uid, displayName , email} = login.user;
      if (!email || !uid || !displayName) {
        setError("No se pudo iniciar sesión con Google.");
        return;
      }
      const age = null;
      // TO DO:
      // Add a cape to search if the user is alredy registered, avoiding doing this process everytime
      await api.createOAuthProfile({userProfile: {uid, displayName, age, email}, provider: "google"});
      navigate("/meetings");
    } catch {
      setError("No se pudo iniciar sesión con Google.");
    }
  }

  async function handleGithub() {
    setError(null);
    try {
      const login = await loginGithub();
      const {uid, displayName , email} = login.user;
      // We only check uid bcs sometimes Github doesn't retrieve information about user's name or email.
      if (!uid ) {
        setError("No se pudo iniciar sesión con Github.");
        return;
      }
      const age = null;
      const response = await api.createOAuthProfile({userProfile: {uid, displayName, age, email}, provider: "github"});
      navigate("/meetings");
    } catch (err: any) {
      console.error(err);

      let msg = "No se pudo iniciar sesión con GitHub.";

      switch (err?.code) {
        case "auth/operation-not-allowed":
          msg =
            "GitHub no está habilitado como proveedor en Firebase. Revisa la consola de Firebase en Autenticación → Métodos de acceso.";
          break;
        case "auth/account-exists-with-different-credential":
          msg =
            "Ya existe una cuenta con este correo usando otro proveedor. Inicia sesión con el proveedor original y vincula GitHub.";
          break;
        case "auth/popup-blocked":
          msg =
            "El navegador bloqueó la ventana emergente. Habilita las ventanas emergentes para este sitio.";
          break;
        case "auth/unauthorized-domain":
          msg =
            "El dominio actual no está autorizado en Firebase. Revisa Autenticación → Configuración.";
          break;
      }

      setError(msg);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-50">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl px-8 py-10 shadow-xl">
        {/* Títulos centrados */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold mb-2">
            Inicia sesión en LinkUp
          </h1>
          <p className="text-sm text-slate-400">
            Ingresa con tu correo o utiliza uno de tus proveedores
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-center">
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 mb-6">
          <label className="text-sm grid gap-1">
            <span>Correo electrónico</span>
            <input
              type="email"
              className="h-11 rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm"
              placeholder="nombre@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="text-sm grid gap-1">
            <span>Contraseña</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="h-11 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 pr-10 text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-100"
                aria-label={
                  showPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                <span role="img" aria-hidden="true">
                  👁
                </span>
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loadingEmail}
            className="mt-2 h-11 rounded-lg bg-sky-500 text-sm font-medium flex items-center justify-center hover:bg-sky-400 disabled:opacity-60 transition-colors"
          >
            {loadingEmail && (
              <span className="mr-2 inline-block w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            )}
            {loadingEmail ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Separador centrado */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-5">
          <span className="h-px flex-1 bg-slate-700" />
          <span>o continúa con</span>
          <span className="h-px flex-1 bg-slate-700" />
        </div>

        {/* Botones de proveedores centrados */}
        <div className="grid gap-3 mb-6">
          {import.meta.env.VITE_GOOGLE_PROVIDER_ENABLED === "true" && (
            <button
              type="button"
              onClick={handleGoogle}
              className="h-11 rounded-lg bg-slate-950 border border-slate-700 px-4 text-sm flex items-center justify-center gap-3 hover:border-sky-500 hover:bg-slate-800/50 transition-all duration-200"
            >
              {/* Logo real de Google */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium">
                Continuar con Google
              </span>
            </button>
          )}

          {import.meta.env.VITE_GITHUB_PROVIDER_ENABLED === "true" && (
            <button
              type="button"
              onClick={handleGithub}
              className="h-11 rounded-lg bg-slate-950 border border-slate-700 px-4 text-sm flex items-center justify-center gap-3 hover:border-sky-500 hover:bg-slate-800/50 transition-all duration-200"
            >
              {/* Logo real de GitHub */}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="font-medium">
                Continuar con GitHub
              </span>
            </button>
          )}
        </div>

        {/* Enlaces centrados */}
        <div className="flex flex-col gap-3 text-sm text-slate-400 text-center">
          <div>
            ¿Olvidaste tu contraseña?{" "}
            <Link
              to="/auth/reset"
              className="text-sky-400 hover:underline font-medium"
            >
              Recuperar contraseña
            </Link>
          </div>
          <div>
            ¿No tienes cuenta?{" "}
            <Link
              to="/auth/register"
              className="text-sky-400 hover:underline font-medium"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}