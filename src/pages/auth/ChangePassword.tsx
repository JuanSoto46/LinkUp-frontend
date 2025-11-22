import { FormEvent, useState } from "react";
import { changePassword } from "../../lib/firebase";

/** Change password screen for logged-in user. */
export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setMessage("Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(
        err?.message || "No se pudo actualizar la contraseña."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-50">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl px-8 py-10 shadow-xl">
        <h1 className="text-2xl font-semibold mb-6">
          Cambiar contraseña
        </h1>

        {message && (
          <p className="mb-4 text-sm text-emerald-400">{message}</p>
        )}
        {error && (
          <p className="mb-4 text-sm text-red-400">{error}</p>
        )}

        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="text-sm grid gap-1">
            <span>Contraseña actual</span>
            <input
              type="password"
              className="h-11 rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>

          <label className="text-sm grid gap-1">
            <span>Nueva contraseña</span>
            <input
              type="password"
              className="h-11 rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>

          <label className="text-sm grid gap-1">
            <span>Confirmar contraseña</span>
            <input
              type="password"
              className="h-11 rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 rounded-lg bg-sky-500 text-sm font-medium hover:bg-sky-400 disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </main>
  );
}
