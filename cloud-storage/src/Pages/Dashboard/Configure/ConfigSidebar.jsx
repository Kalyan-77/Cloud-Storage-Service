import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaCloud,
  FaDesktop,
  FaCode,
  FaDatabase,
  FaShieldAlt,
  FaBell,
  FaUsers,
  FaCog
} from "react-icons/fa";

const ConfigSidebar = () => {
  const location = useLocation();

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const configSections = [
    {
      title: 'General',
      items: [
        { id: 'cloud', icon: FaCloud, label: 'Cloud Settings', path: '/dashboard/configure', description: 'Configure cloud storage and sync' },
        { id: 'mac', icon: FaDesktop, label: 'Desktop App', path: '/dashboard/configure/installesapps', description: 'Mac and Windows client settings' },
        { id: 'api', icon: FaCode, label: 'API & Integrations', path: '/dashboard/configure/api', description: 'API keys and webhooks' },
      ]
    },
    {
      title: 'Advanced',
      items: [
        { id: 'database', icon: FaDatabase, label: 'Database', path: '#', description: 'Database configuration' },
        { id: 'security', icon: FaShieldAlt, label: 'Security', path: '#', description: 'Authentication and permissions' },
        { id: 'notifications', icon: FaBell, label: 'Notifications', path: '#', description: 'Email and push alerts' },
      ]
    },
  ];

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-hidden">
      <div className="w-full max-w-sm h-full bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Configuration Sections */}
        <nav className="px-6 py-6 flex-1 overflow-hidden">
          {configSections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></div>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3">
                  {section.title}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-l from-gray-300 to-transparent"></div>
              </div>

              <div className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`block px-4 py-3 rounded-xl transition-all duration-200 group no-underline ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]' 
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                          isActive 
                            ? 'bg-white/20' 
                            : 'bg-white group-hover:bg-blue-50'
                        }`}>
                          <Icon className={`text-lg ${
                            isActive 
                              ? 'text-white' 
                              : 'text-blue-600 group-hover:text-blue-700'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-semibold ${
                              isActive ? 'text-white' : 'text-gray-900'
                            }`}>
                              {item.label}
                            </h3>
                            {isActive && (
                              <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">
                                Active
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${
                            isActive 
                              ? 'text-blue-100' 
                              : 'text-gray-500 group-hover:text-gray-600'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-8 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">
            Last updated: {new Date().toLocaleDateString()} • Version 2.4.1
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigSidebar;