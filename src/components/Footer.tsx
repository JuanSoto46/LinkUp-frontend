import { Link } from "react-router-dom";

/**
 * Footer component with sitemap and information
 * Implements usability heuristic: Help and documentation
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">LinkUp</h3>
            <p className="text-gray-300 text-sm">
              Educational video conferencing platform prototype for Sprint 1.
              Focused on user management and responsive design.
            </p>
          </div>

          {/* Sitemap */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Sitemap</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/explore" 
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link 
                  to="/create-meeting" 
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  Create Meeting
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Authentication Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/auth/login" 
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/auth/register" 
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link 
                  to="/auth/reset" 
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  Reset Password
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Contact</h4>
            <address className="text-sm text-gray-300 not-italic">
              <p className="mb-2">Email: team@linkup.example</p>
              <p>Support available 24/7</p>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-300 text-sm">
            © {currentYear} LinkUp Video Platform. Sprint 1 - Educational Prototype.
          </p>
        </div>
      </div>
    </footer>
  );
}