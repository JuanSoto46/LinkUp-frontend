import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { api } from "../lib/api";

/** 
 * Profile page for user to view and edit their information
 * Implements usability heuristic: User control and freedom
 */
export default function Profile() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const uid = auth.currentUser?.uid;

  useEffect(() => { 
    (async() => {
      if (!uid) {
        setLoading(false);
        return;
      }
      
      try {
        console.log("Fetching profile for UID:", uid);
        const response = await api.getUser(uid);
        console.log("Profile API response:", response);
        
        if (response.success && response.user) {
          setData(response.user);
        } else {
          setError("Failed to load profile data");
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })(); 
  }, [uid]);

  async function save() {
    if (!uid || !data) return;
    
    setSaving(true);
    try {
      // Preparar los datos para enviar - manejar correctamente el tipo de age
      const updateData: any = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || ''
      };
      
      // Manejar age correctamente - puede ser string o number
      if (data.age !== undefined && data.age !== null && data.age !== '') {
        updateData.age = Number(data.age);
      } else {
        updateData.age = null;
      }
      
      await api.updateUser(uid, updateData);
      alert("Profile updated successfully!");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function destroy() {
    if (!uid) return;
    
    if (!confirm("This will delete your account permanently. Continue?")) return;
    
    try {
      await api.deleteUser(uid);
      await auth.signOut();
      window.location.href = "/";
    } catch (err: any) {
      console.error("Error deleting account:", err);
      alert("Failed to delete account: " + err.message);
    }
  }

  if (!uid) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
        <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
        <a 
          href="/auth/login" 
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
        <p className="text-gray-600 mt-4">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 text-center">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Profile Data</h1>
        <p className="text-gray-600">Unable to load your profile information.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            id="firstName"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={data.firstName || ""}
            onChange={e => setData({...data, firstName: e.target.value})}
            aria-label="First name"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            id="lastName"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={data.lastName || ""}
            onChange={e => setData({...data, lastName: e.target.value})}
            aria-label="Last name"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
            Age
          </label>
          <input
            id="age"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            type="number"
            min="1"
            max="120"
            value={data.age ?? ''}
            onChange={e => setData({...data, age: e.target.value === '' ? null : e.target.value})}
            aria-label="Age"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            type="email"
            value={data.email || ""}
            onChange={e => setData({...data, email: e.target.value})}
            aria-label="Email"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={destroy}
            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-semibold"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}