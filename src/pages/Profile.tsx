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
 * Profile page component.
 * 
 * Responsibilities:
 * - Sync user profile between Firebase Auth and backend API.
 * - Allow user to update basic profile fields.
 * - Allow user to delete their account.
 * - Show better UX feedback when backend is slow (cold start).
 */
export default function Profile() {
  const navigate = useNavigate();
  const [firebaseUser, setFirebaseUser] =
    useState<FirebaseUser | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    age: null,
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // UX flags to improve perceived performance
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSlowLoading, setIsSlowLoading] = useState(false);

  useEffect(() => {
    /**
     * Listen for Firebase Auth state changes and
     * load or create the user profile in backend.
     */
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        navigate("/auth/login");
        return;
      }

      setFirebaseUser(u);
      setLoading(true);
      setError(null);
      setInfo(null);

      const displayName = (u.displayName || "").trim();
      const parts = displayName.split(" ");
      const fbFirstName = parts[0] || "";
      const fbLastName = parts.slice(1).join(" ") || "";

      try {
        // 1) Try to get from backend
        const res = await api.getUser(u.uid);
        const data = (res as any).user || (res as any).data || res;

        const rawFirst = (data.firstName ?? "") as string;
        const rawLast = (data.lastName ?? "") as string;
        const rawEmail = (data.email ?? "") as string;

        const firstName =
          rawFirst.trim() !== ""
            ? rawFirst
            : fbFirstName || "Usuario";

        const lastName =
          rawLast.trim() !== ""
            ? rawLast
            : fbLastName || "";

        const email =
          rawEmail.trim() !== ""
            ? rawEmail
            : u.email || "";

        setProfile({
          firstName,
          lastName,
          age:
            typeof data.age === "number"
              ? data.age
              : data.age
              ? Number(data.age)
              : null,
          email,
        });

        setInfo(null);
      } catch (e: any) {
        console.error("Error cargando perfil:", e);

        const msg = (e?.message || "").toLowerCase();
        const isNotFound = msg.includes("user not found");

        if (isNotFound) {
          // 2) Only if backend returns "User not found", create profile
          const newProfile: UserProfile = {
            firstName: fbFirstName || "Usuario",
            lastName: fbLastName || "",
            age: null,
            email: u.email || "",
          };

          try {
            await api.updateUser(u.uid, newProfile);
            setProfile(newProfile);
            setInfo(
              "Perfil creado automáticamente en el servidor. Puedes actualizar tus datos y se mantendrán guardados."
            );
          } catch (inner: any) {
            console.error("Error creando perfil en backend:", inner);
            setProfile(newProfile);
            setError(
              "No se pudo sincronizar tu perfil con el servidor. Tus cambios podrían no guardarse."
            );
          }
        } else {
          // 3) For other errors, keep a local fallback using Firebase data
          const fallbackProfile: UserProfile = {
            firstName: fbFirstName || "Usuario",
            lastName: fbLastName || "",
            age: null,
            email: u.email || "",
          };

          setProfile(fallbackProfile);
          setError(
            "No se pudo cargar tu perfil desde el servidor. Intenta recargar la página o iniciar sesión de nuevo."
          );
        }
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
        setIsSlowLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  /**
   * Slow-loading hint when backend takes too long
   * (typical cold-start behaviour in free hosting).
   */
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setIsSlowLoading(true);
      }, 3000); // 3s threshold to consider it "slow"
      return () => clearTimeout(timer);
    } else {
      setIsSlowLoading(false);
    }
  }, [loading]);

  /**
   * Local profile state updater for controlled inputs.
   *
   * @param key Field to update.
   * @param value New value for the field.
   */
  function onChange<K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K]
  ) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  /**
   * Handle profile submit and send updated data to backend.
   */
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseUser) return;

    setError(null);
    setInfo(null);
    setSaving(true);

    try {
      await api.updateUser(firebaseUser.uid, {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        age:
          profile.age !== null && profile.age !== undefined
            ? Number(profile.age)
            : null,
        email: profile.email.trim(),
      });

      setInfo("Perfil actualizado correctamente.");
    } catch (e: any) {
      console.error("Error actualizando perfil:", e);
      setError(
        e?.message || "No se pudo actualizar el perfil."
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * Handle account deletion:
   * - removes user from backend
   * - removes Firebase Auth account
   * - redirects to login page
   */
  async function handleDelete() {
    if (!firebaseUser) return;
    if (!confirm("¿Seguro que quieres eliminar tu cuenta?")) return;

    setDeleting(true);
    setError(null);

    try {
      await api.deleteUser(firebaseUser.uid);
      await firebaseUser.delete();
      navigate("/auth/login");
    } catch (e: any) {
      console.error("Error eliminando cuenta:", e);
      setError(
        e?.message || "No se pudo eliminar la cuenta."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading && isInitialLoad) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#050816] p-6 text-sm text-slate-300 animate-pulse">
        Cargando perfil...
        {isSlowLoading && (
          <p className="mt-2 text-xs text-slate-400">
            El servidor está despertando, esto puede tardar unos segundos.
          </p>
        )}
      </div>
    );
  }

  return (
    <main className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-50 mb-6">
        Mi perfil
      </h1>

      {/* Background refresh hint */}
      {!isInitialLoad && loading && (
        <div className="mb-3 text-xs text-slate-400">
          Actualizando información de perfil...
        </div>
      )}

      {info && (
        <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          {info}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-slate-800 bg-[#050816] p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400">
              Nombres
            </label>
            <input
              className="mt-1 h-11 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm"
              value={profile.firstName}
              onChange={(e) =>
                onChange("firstName", e.target.value)
              }
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">
              Apellidos
            </label>
            <input
              className="mt-1 h-11 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm"
              value={profile.lastName}
              onChange={(e) =>
                onChange("lastName", e.target.value)
              }
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400">Edad</label>
          <input
            type="number"
            min={1}
            className="mt-1 h-11 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm"
            value={profile.age ?? ""}
            onChange={(e) =>
              onChange(
                "age",
                e.target.value ? Number(e.target.value) : null
              )
            }
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">
            Correo
          </label>
          <input
            type="email"
            className="mt-1 h-11 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 text-sm"
            value={profile.email}
            onChange={(e) =>
              onChange("email", e.target.value)
            }
            required
          />
        </div>

        <button
          disabled={saving}
          className="h-11 w-full rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-semibold disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>

        <hr className="my-6 border-slate-800" />

        <button
          type="button"
          disabled={deleting}
          onClick={handleDelete}
          className="h-11 w-full rounded-lg border border-red-500/70 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-60"
        >
          {deleting ? "Eliminando..." : "Eliminar cuenta"}
        </button>
      </form>
    </main>
  );
}
