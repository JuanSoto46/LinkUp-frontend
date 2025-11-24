// src/pages/auth/ResetPassword.tsx
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resetPassword } from "../../lib/firebase";

/** Screen to request a password reset email. */
export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await resetPassword(email);

      setSuccess(
        "Si el correo está registrado, recibirás un enlace para crear una nueva contraseña."
      );

      // redirigir al login después de unos segundos
      setTimeout(() => {
        navigate("/auth/login", { replace: true });
      }, 3000);
    } catch (err: any) {
      console.error(err);
      let msg = "No se pudo enviar el correo de recuperación.";

      if (err?.code === "auth/invalid-email") {
        msg = "El formato del correo no es válido.";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-50">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl px-8 py-10 shadow-xl">
        <h1 className="text-2xl font-semibold mb-2">
          Recuperar contraseña
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Ingresa tu correo electrónico y te enviaremos un enlace para
          restablecer tu contraseña.
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 text-sm text-emerald-400">{success}</p>
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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 rounded-lg bg-sky-500 text-sm font-medium flex items-center justify-center hover:bg-sky-400 disabled:opacity-60"
          >
            {loading ? "Enviando correo..." : "Enviar enlace"}
          </button>
        </form>

        <div className="text-sm text-slate-400">
          <Link to="/auth/login" className="text-sky-400 hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
