import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Menu, X, ChevronDown, LogOut, UserCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

// These imports should come from your actual files
import { useAuth } from '../../Context/AuthContext';
import { BASE_URL } from '../../../config';


export default function CloudStorageNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingMacEnvironment, setIsLoadingMacEnvironment] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Search database with all features and pages
  const searchDatabase = [
    { name: 'Home', path: '/dashboard', description: 'Dashboard overview and quick access', keywords: ['dashboard', 'home', 'main', 'overview'] },
    { name: 'Configuration', path: '/dashboard/configure', description: 'Configure cloud storage and sync settings', keywords: ['config', 'settings', 'configure', 'setup'] },
    { name: 'Cloud Storage', path: '/dashboard/cloud', description: 'Access and manage your files', keywords: ['cloud', 'storage', 'files', 'drive'] },
    { name: 'Desktop Apps', path: '/dashboard/configure/installesapps', description: 'View and manage installed applications', keywords: ['apps', 'applications', 'installed', 'programs'] },
    { name: 'API & Integrations', path: '/dashboard/configure/api', description: 'API keys and webhook configurations', keywords: ['api', 'integration', 'webhook', 'keys'] },
    { name: 'Profile', path: '/dashboard/profile', description: 'Manage your account and personal info', keywords: ['profile', 'account', 'user', 'personal'] },
    { name: 'Settings', path: '/dashboard/settings', description: 'Customize your preferences', keywords: ['settings', 'preferences', 'options'] },
    { name: 'Storage Tracking', path: '/dashboard/storagetracking', description: 'Visual display of storage usage', keywords: ['storage', 'tracking', 'usage', 'space'] },
    { name: 'MacEnvironment', path: 'https://mac-os-woad.vercel.app/', description: 'Launch immersive MacOS experience', keywords: ['mac', 'macos', 'environment', 'kiosk'], isSpecial: true },
    { name: 'My Files', path: '/dashboard/cloud', description: 'Browse all your uploaded files', keywords: ['files', 'my files', 'documents'] },
    { name: 'Recent', path: '/dashboard/cloud', description: 'Recently uploaded files', keywords: ['recent', 'latest', 'new'] },
    { name: 'Starred', path: '/dashboard/cloud/starred', description: 'Your favorite and important files', keywords: ['starred', 'favorites', 'important'] },
    { name: 'Trash', path: '/dashboard/cloud/bin', description: 'Recover or permanently delete files', keywords: ['trash', 'bin', 'deleted', 'recycle'] },
    { name: 'Database Config', path: '/dashboard/configure', description: 'Database configuration settings', keywords: ['database', 'db', 'data'] },
    { name: 'Security', path: '/dashboard/configure', description: 'Authentication and permissions', keywords: ['security', 'auth', 'permissions'] },
    { name: 'Notifications', path: '/dashboard/configure', description: 'Email and push alert settings', keywords: ['notifications', 'alerts', 'email'] },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedIndex(-1); // Reset selection when typing

    if (query.trim().length > 0) {
      const filtered = searchDatabase.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6); // Limit to 6 suggestions
      
      setFilteredSuggestions(filtered);
      setShowSearchSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSearchSuggestions(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSearchSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        } else if (filteredSuggestions.length > 0) {
          handleSuggestionClick(filteredSuggestions[0]);
        }
        break;
      case 'Escape':
        setShowSearchSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle search suggestion click
  const handleSuggestionClick = (item) => {
    setSearchQuery('');
    setShowSearchSuggestions(false);
    setSelectedIndex(-1);
    
    if (item.isSpecial) {
      handleMacEnvironment({ preventDefault: () => {} });
    } else {
      navigate(item.path);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
      handleSuggestionClick(filteredSuggestions[selectedIndex]);
    } else if (filteredSuggestions.length > 0) {
      handleSuggestionClick(filteredSuggestions[0]);
    }
  };

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
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
      
      setIsProfileDropdownOpen(false);
      navigate("/", { replace: true });
      setIsLoggingOut(false);
    }
  };

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

          {/* Center - Search bar with suggestions */}
          <div className="hidden md:block flex-1 max-w-md mx-4 lg:mx-8 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery && setShowSearchSuggestions(true)}
                placeholder="Search features, pages..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Search Suggestions Dropdown */}
            {showSearchSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
                {filteredSuggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item)}
                    className={`w-full px-4 py-3 text-left transition-colors border-b border-gray-100 last:border-b-0 flex items-center space-x-3 ${
                      selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Search className={`w-4 h-4 ${selectedIndex === index ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${selectedIndex === index ? 'text-blue-600' : 'text-gray-900'}`}>
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
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

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleProfileDropdown}
                disabled={isLoggingOut}
                className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <User className="w-4 h-4 text-white" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
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
            <div className="md:hidden relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => searchQuery && setShowSearchSuggestions(true)}
                  placeholder="Search features, pages..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Mobile Search Suggestions */}
              {showSearchSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
                  {filteredSuggestions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleSuggestionClick(item);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left transition-colors border-b border-gray-100 last:border-b-0 flex items-center space-x-3 ${
                        selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Search className={`w-4 h-4 ${selectedIndex === index ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${selectedIndex === index ? 'text-blue-600' : 'text-gray-900'}`}>
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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