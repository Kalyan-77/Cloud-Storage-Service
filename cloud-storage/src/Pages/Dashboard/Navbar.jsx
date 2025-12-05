import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Menu, X, ChevronDown, LogOut, UserCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import { BASE_URL } from '../../../config';

export default function CloudStorageNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingMacEnvironment, setIsLoadingMacEnvironment] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const dropdownRef = useRef(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside dropdown AND not on a button inside dropdown
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          !event.target.closest('button[data-dropdown-action]')) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Handle logout
  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      
      try {
        await axios.post(
          `${BASE_URL}/auth/logout`, 
          {}, 
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        );
      } catch (apiError) {
        console.error("Logout API failed:", apiError.response?.data || apiError.message);
      }
      
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      if (setUser && typeof setUser === 'function') {
        setUser(null);
      }
      
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      sessionStorage.clear();
      
      setIsProfileDropdownOpen(false);
      navigate("/", { replace: true });
      setIsLoggingOut(false);
    }
  };

  // Handle profile navigation
  const handleProfile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoggingOut) return;
    
    try {
      const profileRoute = location.pathname.startsWith('/dashboard') 
        ? '/dashboard/profile' 
        : '/profile';
      
      setIsProfileDropdownOpen(false);
      navigate(profileRoute);
      
    } catch (error) {
      console.error('Profile navigation error:', error);
    }
  };

  // Handle MacEnvironment navigation with loading
  const handleMacEnvironment = (e) => {
    e.preventDefault();
    
    setIsLoadingMacEnvironment(true);
    setCountdown(5);
    
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsLoadingMacEnvironment(false);
          
          try {
            const screen = window.screen;
            const windowFeatures = [
              'fullscreen=yes',
              'menubar=no',
              'toolbar=no',
              'location=no',
              'status=no',
              'resizable=yes',
              'scrollbars=yes',
              `width=${screen.availWidth}`,
              `height=${screen.availHeight}`,
              'left=0',
              'top=0'
            ].join(',');
            const newWindow = window.open('https://mac-os-woad.vercel.app/', '_blank', windowFeatures);
            
            if (newWindow) {
              newWindow.focus();
              
              setTimeout(() => {
                try {
                  if (newWindow.document && newWindow.document.documentElement) {
                    const docElement = newWindow.document.documentElement;
                    
                    const requestFullscreen = docElement.requestFullscreen || 
                                            docElement.mozRequestFullScreen || 
                                            docElement.webkitRequestFullscreen || 
                                            docElement.msRequestFullscreen;
                    
                    if (requestFullscreen) {
                      requestFullscreen.call(docElement).catch(() => {});
                    }
                  }
                } catch (fullscreenError) {
                  console.log('Fullscreen operations failed:', fullscreenError.message);
                }
              }, 3000);
              
            } else {
              const link = document.createElement('a');
              link.href = 'https://mac-os-woad.vercel.app/';
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          } catch (error) {
            console.error('Navigation failed:', error);
            window.location.href = 'https://mac-os-woad.vercel.app/';
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const navLinks = [
    { path: '/dashboard', label: 'Home' },
    { path: '/dashboard/configure', label: 'Configuration' },
    { path: 'https://mac-os-woad.vercel.app/', label: 'MacEnvironment', isSpecial: true },
    { path: '/dashboard/settings', label: 'Settings' },
  ];

  return (
    <>
      {/* Loading Modal for MacEnvironment */}
      {isLoadingMacEnvironment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading MacEnvironment
            </h3>
            <p className="text-gray-600 mb-4">
              Preparing immersive fullscreen MacOS experience...
            </p>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {countdown}
            </div>
            <p className="text-sm text-gray-500">
              {countdown > 1 ? `Opening in kiosk mode in ${countdown} seconds` : 'Entering fullscreen now...'}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Browser UI and taskbar will be hidden
            </p>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and brand */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <a href='/'><img src='https://www.hkcert.org/f/guideline/218189/1200c630/hkcert-Cloud%20Storage%20Security%20banner-1860x1046.jpg' alt="Logo" className="w-full h-full object-cover rounded-lg" /></a>
                </div>
                <div className="absolute -top-1 -left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-300 rounded-full opacity-60"></div>
                <div className="absolute -top-2 left-2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-400 rounded-full opacity-40"></div>
                <div className="absolute top-1 -left-2 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-blue-500 rounded-full opacity-50"></div>
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-gray-700"></div>
            
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              <span className="hidden sm:inline">
                <a href='/'>Cloud Storage Service</a>
              </span>
              <span className="sm:hidden">Cloud</span>
            </h1>
          </div>

          {/* Center - Search bar */}
          <div className="hidden md:block flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search Here....."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Right side - Desktop Navigation and profile */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-18">
            <nav className="flex items-center space-x-4 xl:space-x-6">
              {navLinks.map((link, index) => {
                if (link.isSpecial) {
                  return (
                    <button
                      key={`${link.path}-${index}`}
                      onClick={handleMacEnvironment}
                      disabled={isLoadingMacEnvironment}
                      className={`font-medium text-sm whitespace-nowrap transition-colors disabled:opacity-50 ${
                        isLoadingMacEnvironment
                          ? 'text-blue-400'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      {isLoadingMacEnvironment ? 'Loading...' : link.label}
                    </button>
                  );
                }
                
                return (
                  <Link
                    key={`${link.path}-${index}`}
                    to={link.path}
                    className={`font-medium text-sm whitespace-nowrap transition-colors ${
                      isActiveLink(link.path)
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
                disabled={isLoggingOut}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden xl:block">
                  {user ? user.name : 'Username'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user ? user.name : 'Username'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user ? user.email : 'user@example.com'}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleProfile}
                    disabled={isLoggingOut}
                    data-dropdown-action="profile"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    type="button"
                  >
                    <UserCircle className="w-4 h-4 mr-3" />
                    Profile
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    data-dropdown-action="logout"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    type="button"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button and profile */}
          <div className="flex lg:hidden items-center space-x-3">
            {/* Mobile Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleProfileDropdown}
                disabled={isLoggingOut}
                className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <User className="w-4 h-4 text-white" />
              </button>

              {/* Mobile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user ? user.name : 'Username'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user ? user.email : 'user@example.com'}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleProfile}
                    disabled={isLoggingOut}
                    data-dropdown-action="profile"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    type="button"
                  >
                    <UserCircle className="w-4 h-4 mr-3" />
                    Profile
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    data-dropdown-action="logout"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    type="button"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-sm fixed top-16 left-0 right-0 z-40">
          <div className="px-4 py-3 space-y-3">
            {/* Mobile search bar */}
            <div className="md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search Here....."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            
            {/* Mobile navigation */}
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link, index) => {
                if (link.isSpecial) {
                  return (
                    <button
                      key={`mobile-${link.path}-${index}`}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleMacEnvironment({ preventDefault: () => {} });
                      }}
                      disabled={isLoadingMacEnvironment}
                      className={`block px-3 py-2 rounded-md font-medium text-sm transition-colors text-left disabled:opacity-50 ${
                        isLoadingMacEnvironment
                          ? 'text-blue-400 bg-blue-50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {isLoadingMacEnvironment ? 'Loading...' : link.label}
                    </button>
                  );
                }
                
                return (
                  <Link
                    key={`mobile-${link.path}-${index}`}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                      isActiveLink(link.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}