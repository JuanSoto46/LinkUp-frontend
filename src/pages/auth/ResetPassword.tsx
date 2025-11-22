import { FormEvent, useState } from "react";
import { resetPassword } from "../../lib/firebase";

/**
 * Forgot password screen.
 */
export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");

    try {
      await resetPassword(email);
      setMsg("Te enviamos un correo para restablecer tu contraseña.");
    } catch (error: any) {
      setErr(
        error?.message || "No se pudo enviar el correo de recuperación."
      );
    }
  }

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-50">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl px-8 py-10 shadow-xl">
        <h1 className="text-2xl font-semibold mb-3">
          Recuperar contraseña
        </h1>
        <p className="text-sm text-slate-400 mb-4">
          Ingresa el correo con el que te registraste. Te enviaremos
          un enlace para crear una nueva contraseña.
        </p>

        {msg && <p className="mb-3 text-sm text-emerald-400">{msg}</p>}
        {err && <p className="mb-3 text-sm text-red-400">{err}</p>}

        <form onSubmit={handleSubmit} className="grid gap-4">
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

          <button className="h-11 rounded-lg bg-sky-500 text-sm font-medium hover:bg-sky-400">
            Enviar enlace
          </button>
        </form>
      </div>
    </main>
  );
}
