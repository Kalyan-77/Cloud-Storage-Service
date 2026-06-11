import { useState, useEffect } from 'react';
import { Cloud, HardDrive, CheckCircle, Server, Loader2 } from 'lucide-react';
import { useAuth } from '../../../Context/AuthContext';
import { BASE_URL } from '../../../../config';
import Loading from '../../../Components/Loading';

export default function CloudConfig() {
  const { user, refreshUser } = useAuth();
  const [storageType, setStorageType] = useState('GoogleDrive');
  const [storagePath, setStoragePath] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [ipStatus, setIpStatus] = useState(null);
  const [isCheckingIp, setIsCheckingIp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDriveConnection, setIsLoadingDriveConnection] = useState(true);
  const [isDisconnectingDrive, setIsDisconnectingDrive] = useState(false);
  const [googleDriveConnection, setGoogleDriveConnection] = useState({
    connected: false,
    email: '',
    name: ''
  });
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
      loadDriveConnection();
    } else {
      setIsLoading(false);
      setIsLoadingDriveConnection(false);
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
      if(response){
        console.log("Session Working....");
      }else{
        console.log("Session Not Working...");
      }

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

          if (latestConfig.type === 'LocalStorage' && latestConfig.localStorage) {
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

  const loadDriveConnection = async () => {
    if (!user?._id) {
      setIsLoadingDriveConnection(false);
      return;
    }

    try {
      setIsLoadingDriveConnection(true);
      const response = await fetch(`${BASE_URL}/auth/${user._id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const profile = data.user || data;

        setGoogleDriveConnection({
          connected: Boolean(profile.googleRefreshToken || profile.googleAccessToken || profile.googleId),
          email: profile.email || '',
          name: profile.name || ''
        });
      } else {
        setGoogleDriveConnection({ connected: false, email: '', name: '' });
      }
    } catch (error) {
      console.error('Error loading Google Drive connection:', error);
      setGoogleDriveConnection({ connected: false, email: '', name: '' });
    } finally {
      setIsLoadingDriveConnection(false);
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
      if (!googleDriveConnection.connected) {
        showNotification('Please connect Google Drive before saving.', 'error');
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
              driveConnected: true
            }
          : {
              localStorage: {
                storagePath
              }
            })
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
    setStoragePath('');
    setIpAddress('');
    setIpStatus(null);
    showNotification('Form cleared', 'info');
  };

  const handleConnectGoogleDrive = () => {
    window.location.href = `${BASE_URL}/auth/google/connect`;
  };

  const handleDisconnectGoogleDrive = async () => {
    if (!user?._id) {
      showNotification('Please log in to disconnect Google Drive', 'error');
      return;
    }

    setIsDisconnectingDrive(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/google/disconnect`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setGoogleDriveConnection({ connected: false, email: '', name: '' });
        showNotification(data.message || 'Google Drive disconnected successfully', 'success');
        await refreshUser?.();
        await loadDriveConnection();
      } else {
        showNotification(data.message || 'Failed to disconnect Google Drive', 'error');
      }
    } catch (error) {
      console.error('Error disconnecting Google Drive:', error);
      showNotification('Network error: Failed to disconnect Google Drive', 'error');
    } finally {
      setIsDisconnectingDrive(false);
    }
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

        {/* Google Drive Connection */}
        {storageType === 'GoogleDrive' && (
          <div className="mb-6 sm:mb-8 rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-xl  p-2 text-white shadow-lg shadow-blue-200">
                  <img src="/Google_Drive_icon_(2026).svg" alt="Google_Drive" className="h-9 w-9 object-contain" />
                </div>
                
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Google Drive Connection</h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Google Drive is connected through OAuth. Credentials are no longer entered here and refresh tokens are managed automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <span className={`h-2.5 w-2.5 rounded-full ${isLoadingDriveConnection ? 'bg-yellow-400' : googleDriveConnection.connected ? 'bg-green-500' : 'bg-red-400'}`} />
                <span className="text-sm font-semibold text-gray-700">
                  {isLoadingDriveConnection
                    ? 'Checking connection...'
                    : googleDriveConnection.connected
                      ? 'Google Drive Connected'
                      : 'Google Drive Not Connected'}
                </span>
              </div>
            </div>

            {googleDriveConnection.connected ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="rounded-2xl border border-green-200 bg-green-50/80 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-semibold">Connected user details</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-green-100 bg-white/80 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Connected Email</p>
                      <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                        {googleDriveConnection.email || 'Not available'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-green-100 bg-white/80 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Account Name</p>
                      <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                        {googleDriveConnection.name || 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDisconnectGoogleDrive}
                  disabled={isDisconnectingDrive}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDisconnectingDrive ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    'Disconnect Drive'
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                  <p className="text-sm font-semibold text-gray-900">Google Drive Not Connected</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Connect Google Drive to enable OAuth-backed storage without exposing client credentials in this page.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleConnectGoogleDrive}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                >
                  Connect Google Drive
                </button>
              </div>
            )}
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