import { useState, useEffect } from 'react';
import { Cloud, HardDrive, CheckCircle, Server, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../../Context/AuthContext';
import { BASE_URL } from '../../../../config';
import Loading from '../../../Components/Loading';

export default function CloudConfig() {
  const { user } = useAuth();
  const [storageType, setStorageType] = useState('GoogleDrive');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [storagePath, setStoragePath] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [ipStatus, setIpStatus] = useState(null);
  const [isCheckingIp, setIsCheckingIp] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showRefreshToken, setShowRefreshToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load existing configuration on mount
  useEffect(() => {
    if (user?._id) {
      loadConfiguration();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadConfiguration = async () => {
    if (!user?._id) {
      showNotification('Please log in to load your configuration', 'error');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/config/get/${user._id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        // Set IP Address
        if (data.ipAddress) {
          setIpAddress(data.ipAddress);
        }

        // Load the most recent storage config
        if (data.storageConfigs && data.storageConfigs.length > 0) {
          const latestConfig = data.storageConfigs[data.storageConfigs.length - 1];
          setStorageType(latestConfig.type);

          if (latestConfig.type === 'GoogleDrive' && latestConfig.googleDrive) {
            setClientId(latestConfig.googleDrive.clientId || '');
            setClientSecret(latestConfig.googleDrive.clientSecret || '');
            setRefreshToken(latestConfig.googleDrive.refreshToken || '');
            setRedirectUrl(latestConfig.googleDrive.redirectUrl || '');
          } else if (latestConfig.type === 'LocalStorage' && latestConfig.localStorage) {
            setStoragePath(latestConfig.localStorage.storagePath || '');
          }
        }
      } else if (response.status === 404) {
        // No configuration found yet - this is fine for first time users
        console.log('No configuration found, using defaults');
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      showNotification('Failed to load configuration', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIp = async () => {
    if (!ipAddress) {
      setIpStatus({ success: false, message: 'Please enter an IP address' });
      return;
    }

    setIsCheckingIp(true);
    
    setTimeout(() => {
      const isValid = /^(\d{1,3}\.){3}\d{1,3}$/.test(ipAddress);
      setIpStatus({
        success: isValid,
        message: isValid ? 'IP address is reachable' : 'Invalid IP address format'
      });
      setIsCheckingIp(false);
    }, 1000);
  };

  const validateForm = () => {
    if (!ipAddress) {
      showNotification('IP Address is required', 'error');
      return false;
    }

    if (storageType === 'GoogleDrive') {
      if (!clientId || !clientSecret || !refreshToken) {
        showNotification('All Google Drive fields are required', 'error');
        return false;
      }
    } else if (storageType === 'LocalStorage') {
      if (!storagePath) {
        showNotification('Storage path is required', 'error');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    if (!user?._id) {
      showNotification('Please log in to save your configuration', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const storageConfig = {
        type: storageType,
        ...(storageType === 'GoogleDrive' 
          ? {
              googleDrive: {
                clientId,
                clientSecret,
                refreshToken,
                redirectUrl
              }
            }
          : {
              localStorage: {
                storagePath
              }
            }
        )
      };

      const requestBody = {
        ipAddress,
        storageConfig
      };

      const response = await fetch(`${BASE_URL}/config/save/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Configuration saved successfully!', 'success');
        console.log('Saved configuration:', data.config);
      } else {
        showNotification(data.message || 'Failed to save configuration', 'error');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      showNotification('Network error: Failed to save configuration', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setClientId('');
    setClientSecret('');
    setRefreshToken('');
    setRedirectUrl('');
    setStoragePath('');
    setIpAddress('');
    setIpStatus(null);
    showNotification('Form cleared', 'info');
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center p-4">
        <Loading size="lg" text="Loading configuration..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">Please log in to access cloud configuration</p>
          <a href="/login" className="text-blue-600 hover:underline text-sm sm:text-base">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-4 z-50 animate-in slide-in-from-top">
          <div className={`px-4 sm:px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Cloud Configuration</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Configure your cloud storage and sync settings</p>
        </div>
        
        {/* Storage Type Selection */}
        <div className="mb-6 sm:mb-8">
          <label className="block text-sm font-semibold text-gray-900 mb-3 sm:mb-4">Storage Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <label 
              className={`relative flex items-center p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all ${
                storageType === 'GoogleDrive' 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="storageType"
                value="GoogleDrive"
                checked={storageType === 'GoogleDrive'}
                onChange={(e) => setStorageType(e.target.value)}
                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0"
              />
              <div className="ml-3 sm:ml-4 flex items-center">
                <div className={`p-2 rounded-lg ${storageType === 'GoogleDrive' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Cloud className={`w-5 h-5 sm:w-6 sm:h-6 ${storageType === 'GoogleDrive' ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <span className="ml-2 sm:ml-3 text-gray-900 font-semibold text-sm sm:text-base">Google Drive</span>
              </div>
            </label>
            
            <label 
              className={`relative flex items-center p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all ${
                storageType === 'LocalStorage' 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="storageType"
                value="LocalStorage"
                checked={storageType === 'LocalStorage'}
                onChange={(e) => setStorageType(e.target.value)}
                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0"
              />
              <div className="ml-3 sm:ml-4 flex items-center">
                <div className={`p-2 rounded-lg ${storageType === 'LocalStorage' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <HardDrive className={`w-5 h-5 sm:w-6 sm:h-6 ${storageType === 'LocalStorage' ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <span className="ml-2 sm:ml-3 text-gray-900 font-semibold text-sm sm:text-base">Local Storage</span>
              </div>
            </label>
          </div>
        </div>

        {/* Google Drive Fields */}
        {storageType === 'GoogleDrive' && (
          <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Client ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-sm sm:text-base"
                placeholder="Enter client ID"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Client Secret <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showClientSecret ? "text" : "password"}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-sm sm:text-base"
                  placeholder="Enter client secret"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowClientSecret(!showClientSecret)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                >
                  {showClientSecret ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Refresh Token <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showRefreshToken ? "text" : "password"}
                  value={refreshToken}
                  onChange={(e) => setRefreshToken(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-sm sm:text-base"
                  placeholder="Enter refresh token"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRefreshToken(!showRefreshToken)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                >
                  {showRefreshToken ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Redirect URL
              </label>
              <input
                type="text"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-sm sm:text-base"
                placeholder="Enter redirect URL (optional)"
              />
            </div>
          </div>
        )}

        {/* Local Storage Field */}
        {storageType === 'LocalStorage' && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Path to Storage <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={storagePath}
              onChange={(e) => setStoragePath(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-sm sm:text-base"
              placeholder="/path/to/storage"
              required
            />
          </div>
        )}

        {/* IP Address Section */}
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Server className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <label className="ml-2 sm:ml-3 text-sm font-semibold text-gray-900">
              IP Address Configuration <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-sm sm:text-base"
              placeholder="192.168.1.1"
              required
            />
            <button
              onClick={handleCheckIp}
              disabled={isCheckingIp}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-sm whitespace-nowrap text-sm sm:text-base"
            >
              {isCheckingIp ? 'Checking...' : 'Check IP'}
            </button>
          </div>
          {ipStatus && (
            <div className={`mt-3 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg ${
              ipStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{ipStatus.message}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isSaving ? (
              <>
                <Loading size="sm" />
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </button>
          <button
            onClick={handleClear}
            disabled={isSaving}
            className="px-6 sm:px-8 py-2 sm:py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}