import { FormEvent, useState } from "react";
import { api } from "../../lib/api";

/**
 * Password reset page
 * Implements WCAG operable: Clear error messages and success feedback
 */
export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Handle password reset form submission
   */
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await api.forgotPassword(email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to send password reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset password</h1>
        <p className="text-gray-600">Enter your email to receive a reset link</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg" role="alert">
          <p className="text-green-700 text-center">{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <p className="text-red-700 text-center">{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            id="reset-email"
            className="input-field"
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            aria-required="true"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Remember your password?{" "}
          <a href="/auth/login" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
            Back to login
          </a>
        </p>
      </div>
    </div>
  );
}