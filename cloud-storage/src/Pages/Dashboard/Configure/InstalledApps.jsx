import { useState, useEffect } from 'react';
import { Download, Trash2, Check, Loader, Loader2, Save, RefreshCw, Lock } from 'lucide-react';
import { useAuth } from '../../../Context/AuthContext';
import { BASE_URL } from '../../../../config';
import vscode from '../../../assets/Apps/vscode.svg';
import appstore from '../../../assets/Apps/appstore.png';
import bin from '../../../assets/Apps/bin.png';
import calculator from '../../../assets/Apps/calculator.png';
import calender from '../../../assets/Apps/calendar.png';
import contacts from '../../../assets/Apps/contacts.png';
import edge from '../../../assets/Apps/edge.png';
import finder from '../../../assets/Apps/finder.png';
import preferences from '../../../assets/Apps/preferences.png';
import notepad from '../../../assets/Apps/notes.png';
import terminal from '../../../assets/Apps/terminal.png';
import photos from '../../../assets/Apps/photos.png';
import messages from '../../../assets/Apps/message.png';
import map from '../../../assets/Apps/maps.png';
import mail from '../../../assets/Apps/mail.png';
import music from '../../../assets/Apps/music.png';
import reminders from '../../../assets/Apps/reminders.png';
import vlc from '../../../assets/Apps/vlc.png';

export default function InstallApps() {
  const { user } = useAuth();
  
  // Default system apps that cannot be uninstalled
  const defaultSystemApps = ['Finder', 'Preferences', 'App Store', 'Terminal', 'Trash'];

  const [apps, setApps] = useState([
    {
      id: 1,
      name: 'VS Code',
      description: 'Code editor redefined and optimized for building web applications',
      icon: vscode,
      size: '95 MB',
      installed: false,
      installing: false,
      progress: 0,
      isSystemApp: false
    },
    {
      id: 2,
      name: 'App Store',
      description: 'Install and Use new applications',
      icon: appstore,
      size: '550 MB',
      installed: true,
      installing: false,
      progress: 0,
      isSystemApp: true
    },
    {
      id: 3,
      name: 'Trash',
      description: 'System App to Send the Trash',
      icon: bin,
      size: '120 MB',
      installed: true,
      installing: false,
      progress: 0,
      isSystemApp: true
    },
    {
      id: 4,
      name: 'Edge',
      description: 'Fast, secure web browser',
      icon: edge,
      size: '180 MB',
      installed: false,
      installing: false,
      progress: 0,
      isSystemApp: false
    },
    {
      id: 5,
      name: 'Calculator',
      description: 'Used to calculate the Math function',
      icon: calculator,
      size: '210 MB',
      installed: false,
      installing: false,
      progress: 0,
      isSystemApp: false
    },
    {
      id: 6,
      name: 'Calender',
      description: 'To find the dates and months',
      icon: calender,
      size: '45 MB',
      installed: false,
      installing: false,
      progress: 0,
      isSystemApp: false
    },
    {
      id: 7,
      name: 'Contacts',
      description: 'Contacts to list the mobile numbers',
      icon: contacts,
      size: '45 MB',
      installed: false,
      installing: false,
      progress: 0,
      isSystemApp: false
    },
    {
      id: 8,
      name: 'Finder',
      description: 'All Your Documents are present',
      icon: finder,
      size: '45 MB',
      installed: true,
      installing: false,
      progress: 0,
      isSystemApp: true
    },
    {
      id: 9,
      name: 'Preferences',
      description: 'Add Your Preferences to make changes in your OS',
      icon: preferences,
      size: '70 MB',
      installed: true,
      installing: false,
      progress: 0,
      isSystemApp: true
    },
    {
      id: 10,
      name: 'Notes',
      description: 'Create Your own Notes',
      icon: notepad,
      size: '70 MB',
      installed: false,
      installing: false,
      progress: 0,
      isSystemApp: false
    },
    {
      id: 11,
      name: 'Terminal',
      description: 'Use Terminal to make easy',
      icon: terminal,
      size: '70 MB',
      installed: true,
      installing: false,
      progress: 0,
      isSystemApp: true
    },
    {
      id: 12,
      name: 'Photos',
      description: 'See Your Photos',
      icon: photos,
      size: '70 MB',
      installed: false,
      installing: false,
      progress: 0,
      isSystemApp: false
    },
    {
      id: 13,
      name: 'Maps',
      description: 'See Your Location',
      icon: map,
      size: '70 MB',
      installed: false,
      installing: false,
      progress: 0,
      isSystemApp: false
    },
    {
      id: 14,
      name: 'Mail',
      description: 'Send a mail',
      icon: mail,
      size: '70 MB',
      installed: false,
      installing: false,
      progress: 0,
      isSystemApp: false
    },
    {
      id: 15,
      name: 'Messages',
      description: 'See Your messages',
      icon: messages,
      size: '70 MB',
      installed: false,
      installing: false,
      progress: 0,
      isSystemApp: false
    },
    {
      id: 16,
      name: 'Music',
      description: 'Listen music, relax mood',
      icon: music,
      size: '70 MB',
      installed: false,
      installing: false,
      progress: 0,
      isSystemApp: false
    },
    {
      id: 17,
      name: 'Reminders',
      description: 'Unable to remember everything',
      icon: reminders,
      size: '70 MB',
      installed: false,
      installing: false,
      progress: 0,
      isSystemApp: false
    },
    {
      id: 18,
      name: 'VLC',
      description: 'Enjoy with Videos or Movies in VLC',
      icon: vlc,
      size: '100 MB',
      installed: false,
      installing: false,
      progress: 0,
      isSystemApp: false
    }
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notification, setNotification] = useState(null);
  const [installedAppsToSave, setInstalledAppsToSave] = useState([]);

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load configuration on mount
  useEffect(() => {
    if (user?._id) {
      loadConfiguration();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Update installedAppsToSave whenever apps change
  useEffect(() => {
    const installedAppNames = apps
      .filter(app => app.installed)
      .map(app => app.name);
    setInstalledAppsToSave(installedAppNames);
  }, [apps]);

  const loadConfiguration = async () => {
    if (!user?._id) {
      showNotification('Please log in to load your apps', 'error');
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
        
        // Load installed apps from backend
        if (data.desktopApps && data.desktopApps.length > 0) {
          setApps(prevApps =>
            prevApps.map(app => {
              // System apps are always installed
              if (app.isSystemApp) {
                return { ...app, installed: true };
              }
              // Other apps depend on backend data
              return {
                ...app,
                installed: data.desktopApps.includes(app.name)
              };
            })
          );
        }
        setHasUnsavedChanges(false);
      } else if (response.status === 404) {
        // No configuration found yet - this is fine for first time users
        console.log('No configuration found, using defaults');
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      showNotification('Failed to load installed apps', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    if (!user?._id) {
      showNotification('Please log in to save your configuration', 'error');
      return;
    }

    // Validation check
    if (!installedAppsToSave || installedAppsToSave.length === 0) {
      showNotification('No apps to save. Please install at least one app.', 'info');
      return;
    }

    try {
      setIsSaving(true);
      
      const requestBody = {
        desktopApps: installedAppsToSave
      };

      console.log('=== Save Configuration Debug ===');
      console.log('User ID:', user._id);
      console.log('Installed Apps to Save:', installedAppsToSave);
      console.log('Request URL:', `${BASE_URL}/config/save/${user._id}`);
      console.log('Request Body:', requestBody);

      const response = await fetch(`${BASE_URL}/config/save/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);
      
      const data = await response.json();
      console.log('Response Data:', data);

      if (response.ok) {
        showNotification('Desktop apps configuration saved successfully!', 'success');
        setHasUnsavedChanges(false);
        console.log('✅ Configuration saved successfully');
      } else {
        const errorMessage = data.message || 'Failed to save configuration';
        showNotification(errorMessage, 'error');
        console.error('❌ Save failed:', errorMessage);
      }
    } catch (error) {
      console.error('❌ Error saving configuration:', error);
      showNotification(`Network error: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
      console.log('=== End Save Configuration ===');
    }
  };

  const handleInstall = (appId) => {
    const app = apps.find(a => a.id === appId);
    
    // Prevent installing system apps (they're always installed)
    if (app?.isSystemApp) {
      showNotification('This is a system app and is always installed', 'info');
      return;
    }

    setApps(prevApps =>
      prevApps.map(app =>
        app.id === appId
          ? { ...app, installing: true, progress: 0 }
          : app
      )
    );

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      
      if (progress >= 100) {
        clearInterval(interval);
        setApps(prevApps =>
          prevApps.map(app =>
            app.id === appId
              ? { ...app, installed: true, installing: false, progress: 100 }
              : app
          )
        );
        setHasUnsavedChanges(true);
      } else {
        setApps(prevApps =>
          prevApps.map(app =>
            app.id === appId
              ? { ...app, progress: Math.min(progress, 100) }
              : app
          )
        );
      }
    }, 500);
  };

  const handleUninstall = (appId) => {
    const app = apps.find(a => a.id === appId);
    
    // Prevent uninstalling system apps
    if (app?.isSystemApp) {
      showNotification('System apps cannot be uninstalled', 'error');
      return;
    }

    setApps(prevApps =>
      prevApps.map(app =>
        app.id === appId
          ? { ...app, installed: false, progress: 0 }
          : app
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleInstallAll = () => {
    apps.forEach(app => {
      if (!app.installed && !app.installing && !app.isSystemApp) {
        handleInstall(app.id);
      }
    });
  };

  const handleUninstallAll = () => {
    setApps(prevApps =>
      prevApps.map(app => {
        // Keep system apps installed
        if (app.isSystemApp) {
          return app;
        }
        return { ...app, installed: false, installing: false, progress: 0 };
      })
    );
    setHasUnsavedChanges(true);
    showNotification('All non-system apps uninstalled. System apps remain installed.', 'info');
  };

  const installedCount = apps.filter(app => app.installed).length;
  const systemAppsCount = apps.filter(app => app.isSystemApp).length;

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading desktop apps...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to manage desktop apps</p>
          <a href="/login" className="text-blue-600 hover:underline">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <Check className="w-5 h-5" />
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-yellow-800">You have unsaved changes</span>
            </div>
            <button
              onClick={saveConfiguration}
              disabled={isSaving}
              className="px-4 py-1.5 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition font-medium text-sm flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Now
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Desktop App Configuration</h1>
            <p className="text-gray-500 text-sm">Manage Mac and Windows client applications</p>
          </div>
          <button
            onClick={loadConfiguration}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition font-medium text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Installed</p>
                <p className="text-xl font-bold text-blue-600">{installedCount} / {apps.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">System Apps</p>
                <p className="text-xl font-bold text-green-600">{systemAppsCount}</p>
                <p className="text-xs text-gray-500 mt-0.5">Always installed</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Apps List */}
        <div className="space-y-3">
          {apps.map((app) => (
            <div
              key={app.id}
              className={`border rounded-lg p-3 hover:shadow-md transition-all ${
                app.isSystemApp 
                  ? 'border-green-200 bg-green-50/30' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* App Icon */}
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="w-9 h-9 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-lg font-bold">
                    {app.name.charAt(0)}
                  </div>
                </div>

                {/* App Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">{app.name}</h3>
                    {app.isSystemApp && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        System
                      </span>
                    )}
                    {app.installed && !app.installing && !app.isSystemApp && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Installed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{app.description}</p>
                  <p className="text-xs text-gray-400">Size: {app.size}</p>

                  {/* Progress Bar */}
                  {app.installing && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-blue-600">Installing...</span>
                        <span className="text-xs font-medium text-blue-600">{Math.round(app.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${app.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  {app.isSystemApp ? (
                    <button
                      disabled
                      className="px-4 py-1.5 bg-green-100 text-green-600 rounded-md font-medium text-sm cursor-not-allowed flex items-center gap-1.5 border border-green-200"
                      title="System apps cannot be uninstalled"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Protected
                    </button>
                  ) : app.installing ? (
                    <button
                      disabled
                      className="px-4 py-1.5 bg-gray-100 text-gray-400 rounded-md font-medium text-sm cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      Installing
                    </button>
                  ) : app.installed ? (
                    <button
                      onClick={() => handleUninstall(app.id)}
                      className="px-4 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition font-medium text-sm flex items-center gap-1.5 border border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Uninstall
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInstall(app.id)}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium text-sm flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Install
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        <div className="mt-6 flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleInstallAll}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium text-sm shadow-sm"
          >
            Install All
          </button>
          <button
            onClick={handleUninstallAll}
            className="px-5 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 hover:border-gray-400 transition font-medium text-sm"
          >
            Uninstall All (except System)
          </button>
          <button
            onClick={saveConfiguration}
            disabled={isSaving || !hasUnsavedChanges}
            className="ml-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium text-sm shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}