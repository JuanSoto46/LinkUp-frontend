import { FormEvent, useState } from "react";
import { registerEmail } from "../../lib/firebase";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";

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
      // First try to register in backend (it will handle Firebase Auth)
      const response = await api.registerProfile(form);
      
      if (response.success) {
        setOk(true);
        // Redirect to login after successful registration
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      } else {
        setError(response.error || "Registration failed");
      }
    } catch (e: any) {
      console.error("Registration error:", e);
      
      // Handle specific error cases
      if (e.message?.includes('already registered')) {
        setError("This email is already registered. Please try logging in instead.");
      } else if (e.message?.includes('Email already')) {
        setError("This email is already in use. Please use a different email or try logging in.");
      } else {
        setError(e.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create account</h1>
        <p className="text-gray-600">Join LinkUp today</p>
      </div>

      {ok && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg" role="alert">
          <p className="text-green-700 text-center">
            Account created successfully! Redirecting to login...
          </p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <p className="text-red-700 text-center">{error}</p>
          {error.includes("already") && (
            <div className="mt-2 text-center">
              <a 
                href="/auth/login" 
                className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
              >
                Go to Login →
              </a>
            </div>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First name
            </label>
            <input
              id="firstName"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="John"
              value={form.firstName}
              onChange={e => setForm({...form, firstName: e.target.value})}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last name
            </label>
            <input
              id="lastName"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Doe"
              value={form.lastName}
              onChange={e => setForm({...form, lastName: e.target.value})}
              required
              disabled={loading}
            />
          </div>
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
            value={form.age}
            onChange={e => setForm({...form, age: Number(e.target.value)})}
            required
            disabled={loading}
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
            placeholder="john@example.com"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            required
            minLength={6}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
          <a 
            href="/auth/login" 
            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}