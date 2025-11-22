import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "../lib/firebase";
import { api } from "../lib/api";

interface UserProfile {
  firstName: string;
  lastName: string;
  age: number | null;
  email: string;
}

/**
 * Profile screen
 * - Shows and updates basic user info
 * - Allows account deletion
 * - Uses Firebase ID token for backend authorization
 */
export default function Profile() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  async function fetchProfile() {
    if (!firebaseUser) return;
    setLoadingProfile(true);
    setError(null);

    try {
      const response: any = await api.getUser(firebaseUser.uid);
      const data = response.user ?? response;

      setProfile({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        age: data.age ?? null,
        email: data.email ?? firebaseUser.email ?? "",
      });
    } catch (err: any) {
      const message = String(err?.message || err);

      if (
        message.includes("AUTH_REQUIRED") ||
        message.includes("Authorization header is required") ||
        message.includes("Invalid or expired token")
      ) {
        setError("Your session has expired. Please login again.");
      } else {
        setError(message);
      }
    } finally {
      setLoadingProfile(false);
    }
  }

  // Load profile when we have an authenticated user
  useEffect(() => {
    if (firebaseUser) {
      fetchProfile();
    }
  }, [firebaseUser]);

  async function handleSave() {
    if (!firebaseUser || !profile) return;
    setSaving(true);
    setError(null);

    try {
      await api.updateUser(firebaseUser.uid, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        age: profile.age,
        email: profile.email,
      });
      await fetchProfile();
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!firebaseUser) return;
    const confirmed = window.confirm(
      "This will delete your LinkUp account and profile. Continue?"
    );
    if (!confirmed) return;

    try {
      await api.deleteUser(firebaseUser.uid);
      navigate("/auth/login");
    } catch (err: any) {
      setError(String(err?.message || err));
    }
  }

  // === UI states ===

  if (loadingUser) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-50">
        <p className="text-sm text-slate-400">Cargando perfil...</p>
      </main>
    );
  }

  if (!firebaseUser) {
    // No logged user
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-50">
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl px-8 py-10 text-center shadow-xl">
          <h1 className="text-xl font-semibold mb-3">No estás logueado</h1>
          <p className="text-sm text-slate-400 mb-6">
            Inicia sesión para ver y editar tu perfil de LinkUp.
          </p>
          <button
            className="h-11 px-6 rounded-lg bg-sky-500 text-sm font-medium hover:bg-sky-400"
            onClick={() => navigate("/auth/login")}
          >
            Ir a iniciar sesión
          </button>
        </div>
      </main>
    );
  }

  if (error && !profile) {
    // Initial load failed (this es la tarjeta que estás viendo)
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-50">
        <div className="w-full max-w-md bg-slate-900 border border-red-500/60 rounded-2xl px-8 py-10 text-center shadow-xl">
          <p className="mb-4 text-sm text-red-400">{error}</p>
          <button
            className="h-11 px-6 rounded-lg bg-sky-500 text-sm font-medium hover:bg-sky-400"
            onClick={fetchProfile}
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-50">
        <p className="text-sm text-slate-400">
          Datos del perfil no disponibles.
        </p>
      </main>
    );
  }

  // Normal profile form
  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-50">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl px-8 py-10 shadow-xl">
        <h1 className="text-2xl font-semibold mb-1">Mi perfil</h1>
        <p className="text-sm text-slate-400 mb-6">
          Actualiza tu información básica o elimina tu cuenta de Linkup.
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <label className="text-sm grid gap-1">
            <span>Nombres</span>
            <input
              className="h-11 rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm"
              value={profile.firstName}
              onChange={(e) =>
                setProfile({ ...profile, firstName: e.target.value })
              }
              aria-label="First name"
            />
          </label>

          <label className="text-sm grid gap-1">
            <span>Apellidos</span>
            <input
              className="h-11 rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm"
              value={profile.lastName}
              onChange={(e) =>
                setProfile({ ...profile, lastName: e.target.value })
              }
              aria-label="Last name"
            />
          </label>

          <label className="text-sm grid gap-1">
            <span>Edad</span>
            <input
              type="number"
              className="h-11 rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm"
              value={profile.age ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  age: e.target.value ? Number(e.target.value) : null,
                })
              }
              aria-label="Age"
            />
          </label>

          <label className="text-sm grid gap-1">
            <span>Correo</span>
            <input
              type="email"
              className="h-11 rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              aria-label="Email"
            />
          </label>

          <button
            type="submit"
            disabled={saving || loadingProfile}
            className="mt-2 h-11 rounded-lg bg-sky-500 text-sm font-medium hover:bg-sky-400 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        <hr className="my-6 border-slate-800" />

        <button
          type="button"
          onClick={handleDelete}
          className="h-11 w-full rounded-lg border border-red-500/70 text-sm text-red-300 hover:bg-red-500/10"
        >
          Eliminar cuenta
        </button>
      </div>
    </main>
  );
}
