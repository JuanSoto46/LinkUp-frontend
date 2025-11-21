import { FormEvent, useState } from "react";
import { loginEmail, loginGoogle, loginFacebook, logout } from "../../lib/firebase";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

/**
 * Login page with manual and OAuth providers
 * Implements WCAG operable: Keyboard navigation and focus management
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Handle manual login form submission
   */
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Firebase authentication
      await loginEmail(email, password);
      
      // Additional backend login for token
      const user = await api.loginManual({ email, password });
      
      // Store token if needed
      if (user.token) {
        localStorage.setItem('auth_token', user.token);
      }
      
      navigate("/");
    } catch (e: any) {
      setError(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle Google OAuth login
   */
  async function handleGoogleLogin() {
    try {
      setLoading(true);
      setError(null);
      
      const result = await loginGoogle();
      const user = result.user;
      
      // Send to backend
      await api.loginGoogle(await user.getIdToken(), {
        email: user.email,
        name: user.displayName,
        given_name: user.displayName?.split(' ')[0],
        family_name: user.displayName?.split(' ')[1] || '',
      });
      
      navigate("/");
    } catch (e: any) {
      setError(e?.message ?? "Google login failed");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle Facebook OAuth login
   */
  async function handleFacebookLogin() {
    try {
      setLoading(true);
      setError(null);
      
      const result = await loginFacebook();
      const user = result.user;
      
      // Send to backend
      await api.loginFacebook(await user.getIdToken(), {
        email: user.email,
        name: user.displayName,
        first_name: user.displayName?.split(' ')[0],
        last_name: user.displayName?.split(' ')[1] || '',
      });
      
      navigate("/");
    } catch (e: any) {
      setError(e?.message ?? "Facebook login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto border rounded-xl p-6 grid gap-4 bg-white shadow-sm">
      <h1 className="text-2xl font-bold text-center text-gray-800">Login</h1>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            aria-required="true"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            aria-required="true"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid gap-3">
        {import.meta.env.VITE_GOOGLE_PROVIDER_ENABLED === "true" && (
          <button
            type="button"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-colors"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        )}
        
        {import.meta.env.VITE_FACEBOOK_PROVIDER_ENABLED === "true" && (
          <button
            type="button"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 flex items-center justify-center gap-2 transition-colors"
            onClick={handleFacebookLogin}
            disabled={loading}
          >
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </button>
        )}
      </div>

      <div className="text-center text-sm text-gray-600 space-y-2">
        <div>
          <Link 
            className="text-blue-600 hover:text-blue-800 underline transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded" 
            to="/auth/reset"
          >
            Forgot your password?
          </Link>
        </div>
        <div>
          <span className="text-gray-500">Don't have an account? </span>
          <Link 
            className="text-blue-600 hover:text-blue-800 underline transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded" 
            to="/auth/register"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}