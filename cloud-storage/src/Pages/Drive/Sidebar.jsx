import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaFolder, 
  FaShareAlt, 
  FaTrash, 
  FaCog,
  FaClock,
  FaStar,
  FaCloud,
  FaChevronDown,
  FaPlus,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { BASE_URL } from '../../../config';

const Sidebar = () => {
  const location = useLocation();
  const [isStorageExpanded, setIsStorageExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storageData, setStorageData] = useState({
    usage: "0 GB",
    limit: "15 GB",
    usageInDrive: "0 MB",
    usageInDriveTrash: "0 KB",
    loading: true
  });
  const fileInputRef = useRef(null);

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${BASE_URL}/cloud/files`, {
        credentials: 'include'
      });
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('Fetch error:', err);
      setFiles([]);
    }
  };

  const fetchStorageData = async () => {
    try {
      setStorageData(prev => ({ ...prev, loading: true }));
      
      const response = await fetch(`${BASE_URL}/cloud/totalStorage`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStorageData({
          usage: data.usage || "0 GB",
          limit: data.limit || "15 GB",
          usageInDrive: data.usageInDrive || "0 MB",
          usageInDriveTrash: data.usageInDriveTrash || "0 KB",
          loading: false
        });
      } else {
        throw new Error('Failed to fetch storage data');
      }
    } catch (err) {
      console.error('Error fetching storage data:', err);
      setStorageData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchStorageData();
    fetchFiles();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);
    try {
      await fetch(`${BASE_URL}/cloud/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      fetchFiles();
      fetchStorageData();
    } catch (err) {
      console.error('Error Uploading File:', err);
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  const parseStorageString = (storageStr) => {
    const match = storageStr.match(/^([\d.]+)\s*([A-Z]+)$/i);
    if (!match) return 0;
    
    const [, value, unit] = match;
    const numValue = parseFloat(value);
    
    const units = {
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
      'TB': 1024 * 1024 * 1024 * 1024
    };
    
    return numValue * (units[unit.toUpperCase()] || 1);
  };

  const getStoragePercentage = () => {
    const usageBytes = parseStorageString(storageData.usage);
    const limitBytes = parseStorageString(storageData.limit);
    
    if (limitBytes === 0) return 0;
    return Math.min((usageBytes / limitBytes) * 100, 100);
  };

  const getStorageBarColor = () => {
    const percentage = getStoragePercentage();
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-blue-600';
  };

  const isActivePath = (path) => location.pathname === path;

  const menuItems = [
    { id: 'home', icon: FaHome, label: 'Home', path: '/dashboard/cloud' },
    { id: 'recent', icon: FaClock, label: 'Recent', path: '/dashboard/cloud/recent' },
    { id: 'starred', icon: FaStar, label: 'Starred', path: '/dashboard/cloud/starred' },
  ];

  const storageItems = [
    { id: 'files', icon: FaFolder, label: 'My Files', path: '/dashboard/cloud/files' },
    { id: 'shared', icon: FaShareAlt, label: 'Shared with me', path: '/dashboard/cloud/shared' },
    { id: 'trash', icon: FaTrash, label: 'Trash', path: '/dashboard/cloud/bin' },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FaCloud className="text-white text-lg" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Cloud Drive
          </span>
        </div>
      </div>

      {/* New Upload Button */}
      <div className="p-4">
        <button
          onClick={handleUploadClick}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPlus className="text-sm" />
          <span className="font-medium">{loading ? 'Uploading...' : 'New Upload'}</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Quick Access Menu */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
            Quick Access
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group no-underline ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm border-l-4 border-blue-500' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`text-lg ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Storage Section */}
        <div className="mt-6 space-y-1">
          <button
            onClick={() => setIsStorageExpanded(!isStorageExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700 transition-colors cursor-pointer"
          >
            <span>Storage</span>
            <FaChevronDown className={`transform transition-transform ${isStorageExpanded ? 'rotate-180' : ''}`} />
          </button>

          <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isStorageExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            {storageItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group no-underline ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm border-l-4 border-blue-500' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`text-lg ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Storage Usage */}
        <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Storage Used</div>
          
          {storageData.loading ? (
            <div className="animate-pulse">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-gray-300 h-2 rounded-full w-1/2"></div>
              </div>
              <div className="text-xs text-gray-400">Loading...</div>
            </div>
          ) : (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getStorageBarColor()}`} 
                  style={{ width: `${getStoragePercentage()}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {storageData.usage} of {storageData.limit} used
                {getStoragePercentage() > 0 && (
                  <span className="ml-1">({getStoragePercentage().toFixed(1)}%)</span>
                )}
              </div>
            </>
          )}
          
          <button 
            className="mt-3 w-full text-blue-600 hover:text-blue-700 text-sm font-medium py-1 transition-colors cursor-pointer"
            onClick={fetchStorageData}
          >
            {storageData.loading ? 'Loading...' : 'Refresh Storage'}
          </button>
        </div>
      </nav>

      {/* Settings at Bottom */}
      <div className="p-4 border-t border-gray-100">
        <Link
          to="/dashboard/cloud/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group no-underline ${
            isActivePath('/dashboard/cloud/settings')
              ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm border-l-4 border-blue-500'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <FaCog className={`text-lg ${isActivePath('/dashboard/cloud/settings') ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button - Fixed at top */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <FaTimes className="text-gray-700 text-xl" />
        ) : (
          <FaBars className="text-gray-700 text-xl" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex fixed top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 flex-col shadow-sm z-30">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar - Slides in from left */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-screen w-80 max-w-[85vw] bg-white border-r border-gray-200 flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;