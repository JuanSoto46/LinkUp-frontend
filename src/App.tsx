import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import About from "./pages/About";
import Explore from "./pages/Explore";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./pages/Profile";
import CreateMeeting from "./pages/CreateMeeting";
import Footer from "./components/Footer";

/**
 * Main application component
 * @returns {JSX.Element} The rendered App component
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Skip link for accessibility */}
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        
        <Header />
        
        <main id="main" className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/reset" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-meeting" element={<CreateMeeting />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
}