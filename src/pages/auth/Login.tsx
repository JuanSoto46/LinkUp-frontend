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
      navigate("/");
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
      navigate("/");
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
      navigate("/");
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
        <h1 className="text-2xl font-semibold mb-2">
          Inicia sesión en LinkUp
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Ingresa con tu correo o utiliza uno de tus proveedores
          conectados.
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-400" role="alert">
            {error}
          </p>
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
            className="mt-2 h-11 rounded-lg bg-sky-500 text-sm font-medium flex items-center justify-center hover:bg-sky-400 disabled:opacity-60"
          >
            {loadingEmail && (
              <span className="mr-2 inline-block w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            )}
            {loadingEmail ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs text-slate-500 mb-5">
          <span className="h-px flex-1 bg-slate-700" />
          <span>o continúa con</span>
          <span className="h-px flex-1 bg-slate-700" />
        </div>

        <div className="grid gap-3 mb-6">
          {import.meta.env.VITE_GOOGLE_PROVIDER_ENABLED === "true" && (
            <button
              type="button"
              onClick={handleGoogle}
              className="h-11 rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm flex items-center gap-3 hover:border-sky-500"
            >
              <span className="h-7 w-7 rounded-full bg-white grid place-items-center text-xs font-bold text-slate-900">
                G
              </span>
              <span className="flex-1 text-left">
                Continúa con Google
              </span>
            </button>
          )}

          {import.meta.env.VITE_GITHUB_PROVIDER_ENABLED === "true" && (
  <button
    type="button"
    onClick={handleGithub}
    className="h-11 rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm flex items-center gap-3 hover:border-sky-500"
  >
    <span className="h-7 w-7 rounded-full bg-slate-800 grid place-items-center text-xs font-bold">
      GH
    </span>
    <span className="flex-1 text-left">
      Continúa con GitHub
    </span>
  </button>
)}

      </div>

        <div className="flex flex-col gap-2 text-sm text-slate-400">
          <div>
            ¿Olvidaste tu contraseña?{" "}
            <Link
              to="/auth/reset"
              className="text-sky-400 hover:underline"
            >
              Recuperar contraseña
            </Link>
          </div>
          <div>
            ¿No tienes cuenta?{" "}
            <Link
              to="/auth/register"
              className="text-sky-400 hover:underline"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
