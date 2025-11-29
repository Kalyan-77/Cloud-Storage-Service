import React, { useState } from 'react';
import { Cloud, Menu, X, Search, ChevronDown } from 'lucide-react';
import { useAuth } from "../../Context/AuthContext"
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from '../../../config';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true });
      setUser(null); // clear frontend user state
      navigate("/"); // go back to hero page
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // if (loading) return null;

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-full mx-auto px-6">
        <div className="flex justify-around items-center h-16">
          {/* Left side - Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                <img
                  src="https://www.hkcert.org/f/guideline/218189/1200c630/hkcert-Cloud%20Storage%20Security%20banner-1860x1046.jpg"
                  className="w-10 h-6"
                />
              </div>
              <span className="text-sm font-semibold text-gray-800">
                Cloud Storage System
              </span>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <span className="text-sm font-medium text-gray-800">MyCloud</span>
          </div>

          {/* Center - Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-8">
            <a href="#" className="text-md text-gray-700 hover:text-blue-600 transition-colors">
              Explore
            </a>
            <div className="flex items-center space-x-1 text-md text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
              <span>Products</span>
              <ChevronDown className="h-3 w-3" />
            </div>
            <div className="flex items-center space-x-1 text-md text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
              <span>Solutions</span>
              <ChevronDown className="h-3 w-3" />
            </div>
            <div className="flex items-center space-x-1 text-md text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
              <span>Pricing</span>
              <ChevronDown className="h-3 w-3" />
            </div>
            <div className="flex items-center space-x-1 text-md text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
              <span>Partners</span>
              <ChevronDown className="h-3 w-3" />
            </div>
            <div className="flex items-center space-x-1 text-md text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
              <span>Resources</span>
              <ChevronDown className="h-3 w-3" />
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="hidden lg:flex items-center space-x-6">
            {user ? (
              <>
                <span className="text-md text-gray-700">Hi, {user.name}</span>
                <button
                  className="bg-blue-600 text-white px-4 py-1.5 text-md font-medium hover:bg-blue-700 transition-colors rounded-lg"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </button>
                <button
                  className="border border-gray-300 text-gray-700 px-4 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors rounded-lg"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="bg-blue-600 text-white px-4 py-1.5 text-md font-medium hover:bg-blue-700 transition-colors rounded-lg">
                  <a href="/register">Get started for Free</a>
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors rounded-lg">
                  <a href="/login">Sign in</a>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-6 py-4 space-y-3 bg-white border-t border-gray-200">
            <a href="#" className="block text-sm text-gray-700 hover:text-blue-600 transition-colors">
              Explore
            </a>
            <div className="block text-sm text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
              Products
            </div>
            <div className="block text-sm text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
              Solutions
            </div>
            <div className="block text-sm text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
              Pricing
            </div>
            <div className="block text-sm text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
              Partners
            </div>
            <div className="block text-sm text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
              Resources
            </div>
            <div className="pt-3 border-t border-gray-200 space-y-3">
              {user ? (
                <>
                  <span className="block text-sm text-gray-700">Hi, {user.name}</span>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
                    <a href="/register">Get started for Free</a>
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
                    <a href="/login">Sign in</a>
                  </button>
                </> 
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
