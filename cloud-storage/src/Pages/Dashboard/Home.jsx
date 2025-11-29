import React, { useState, useEffect } from 'react';
import { Upload, HardDrive, FileText, RotateCcw, BarChart3, Trash2, File, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { BASE_URL } from '../../../config';


const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [storageData, setStorageData] = useState({
    usage: '0 GB',
    limit: '0 GB',
    usageInDrive: '0 GB',
    usageInDriveTrash: '0 GB'
  });
  const [fileStats, setFileStats] = useState([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(true);

  const services = [
    {
      icon: <Upload className="w-8 h-8 text-gray-600" />,
      title: 'Uploads',
      description: 'Upload Your files and download',
      path: '/dashboard/cloud'
    },
    {
      icon: <HardDrive className="w-8 h-8 text-gray-600" />,
      title: 'Storage Bucket',
      description: 'Store Your Website Data',
      path: '/dashboard/cloud'
    },
    {
      icon: <FileText className="w-8 h-8 text-gray-600" />,
      title: 'File Types',
      description: 'Role based File Organization(pptx,pdf,word, etc...)',
      path: '/dashboard/configure'
    },
    {
      icon: <RotateCcw className="w-8 h-8 text-gray-600" />,
      title: 'File Versioning',
      description: 'Keep track of changes and restore older versions.',
      path: '/dashboard/cloud'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-gray-600" />,
      title: 'Storage Progress Tracking',
      description: 'Visual display of used vs. available storage.',
      path: '/dashboard/profile'
    },
    {
      icon: <Trash2 className="w-8 h-8 text-gray-600" />,
      title: 'File Management',
      description: 'Organize and delete your stored files.',
      path: '/dashboard/cloud/bin'
    }
  ];

  const fileTypes = [
    { type: 'pptx', label: 'PPTs', color: '#10B981' },
    { type: 'pdf', label: 'PDFs', color: '#3B82F6' },
    { type: 'docx', label: 'Word', color: '#F59E0B' },
    { type: 'png', label: 'Images', color: '#EC4899' },
    { type: 'mp4', label: 'Videos', color: '#8B5CF6' },
    { type: 'mp3', label: 'Music', color: '#06B6D4' },
    { type: 'txt', label: 'Bucket Storage', color: '#EF4444' },
    { type: 'xlsx', label: 'Others', color: '#64748B' }
  ];

  useEffect(() => {
    fetchStorageDetails();
  }, []);

  const fetchStorageDetails = async () => {
    setLoading(true);
    try {
      // Fetch total storage
      const storageRes = await fetch(`${BASE_URL}/cloud/totalStorage`);
      const storageJson = await storageRes.json();
      setStorageData(storageJson);

      // Fetch total file count
      const countRes = await fetch(`${BASE_URL}/cloud/filesCount`);
      const countJson = await countRes.json();
      setTotalFiles(countJson.totalFiles || 0);

      // Fetch file counts and storage by type
      const statsPromises = fileTypes.map(async (ft) => {
        try {
          const [countRes, storageRes] = await Promise.all([
            fetch(`${BASE_URL}/cloud/filesCount/type?type=${ft.type}`),
            fetch(`${BASE_URL}/cloud/StorageByType/type?type=${ft.type}`)
          ]);
          
          const countData = await countRes.json();
          const storageData = await storageRes.json();
          
          return {
            type: ft.type,
            label: ft.label,
            color: ft.color,
            count: countData.totalFiles || 0,
            storage: storageData.storage || '0 B'
          };
        } catch (err) {
          return {
            type: ft.type,
            label: ft.label,
            color: ft.color,
            count: 0,
            storage: '0 B'
          };
        }
      });

      const stats = await Promise.all(statsPromises);
      setFileStats(stats);
    } catch (error) {
      console.error('Error fetching storage details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = (path) => {
    navigate(path);
  };

  const parseStorage = (storageStr) => {
    const match = storageStr.match(/(\d+\.?\d*)\s*(Bytes|KB|MB|GB|TB)/);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    const unit = match[2];
    const multipliers = { Bytes: 1, KB: 1024, MB: 1024**2, GB: 1024**3, TB: 1024**4 };
    return value * (multipliers[unit] || 1);
  };

  const calculatePercentage = () => {
    const usageBytes = parseStorage(storageData.usage);
    const limitBytes = parseStorage(storageData.limit);
    if (limitBytes === 0) return 0;
    return Math.round((usageBytes / limitBytes) * 100);
  };

  const calculateFilePercentages = () => {
    if (totalFiles === 0) return fileStats.map(stat => ({ ...stat, percentage: 0 }));
    return fileStats.map(stat => ({
      ...stat,
      percentage: ((stat.count / totalFiles) * 100).toFixed(1)
    }));
  };

  const percentage = calculatePercentage();
  const filePercentages = calculateFilePercentages();
  const usageGB = parseStorage(storageData.usage) / (1024**3);
  const limitGB = parseStorage(storageData.limit) / (1024**3);
  const remainingGB = limitGB - usageGB;

  // Calculate total used percentage for the donut chart
  const totalUsedPercentage = filePercentages.reduce((acc, stat) => acc + parseFloat(stat.percentage), 0);
  const emptyPercentage = 100 - totalUsedPercentage;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div 
                key={index}
                onClick={() => handleServiceClick(service.path)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex flex-col items-start space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-200">
                    <div className="group-hover:text-blue-600 transition-colors duration-200">
                      {service.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage Details Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Storage Details</h2>
            <button
              onClick={fetchStorageDetails}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading storage details...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Main Storage Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-8">Storage Details In %</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Donut Chart */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-64 h-64">
                      <svg viewBox="0 0 200 200" className="transform -rotate-90">
                        {filePercentages.map((stat, index) => {
                          const startAngle = filePercentages
                            .slice(0, index)
                            .reduce((acc, s) => acc + (parseFloat(s.percentage) * 3.6), 0);
                          const endAngle = startAngle + (parseFloat(stat.percentage) * 3.6);
                          const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
                          
                          const startX = 100 + 70 * Math.cos((startAngle * Math.PI) / 180);
                          const startY = 100 + 70 * Math.sin((startAngle * Math.PI) / 180);
                          const endX = 100 + 70 * Math.cos((endAngle * Math.PI) / 180);
                          const endY = 100 + 70 * Math.sin((endAngle * Math.PI) / 180);
                          
                          return (
                            <path
                              key={stat.type}
                              d={`M 100 100 L ${startX} ${startY} A 70 70 0 ${largeArc} 1 ${endX} ${endY} Z`}
                              fill={stat.color}
                              className="transition-all hover:opacity-80"
                            />
                          );
                        })}
                        {/* Empty space segment */}
                        {emptyPercentage > 0 && (
                          <path
                            d={(() => {
                              const startAngle = totalUsedPercentage * 3.6;
                              const endAngle = 360;
                              const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
                              
                              const startX = 100 + 70 * Math.cos((startAngle * Math.PI) / 180);
                              const startY = 100 + 70 * Math.sin((startAngle * Math.PI) / 180);
                              const endX = 100 + 70 * Math.cos((endAngle * Math.PI) / 180);
                              const endY = 100 + 70 * Math.sin((endAngle * Math.PI) / 180);
                              
                              return `M 100 100 L ${startX} ${startY} A 70 70 0 ${largeArc} 1 ${endX} ${endY} Z`;
                            })()}
                            fill="#E5E7EB"
                            className="transition-all"
                          />
                        )}
                        <circle cx="100" cy="100" r="45" fill="white" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">Total Files</div>
                          <div className="text-4xl font-bold text-gray-900">{totalFiles}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: File Type List & Storage Bar */}
                  <div className="flex flex-col justify-between">
                    {/* File Types */}
                    <div className="space-y-3 mb-8">
                      {filePercentages.map((stat) => (
                        <div key={stat.type} className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: stat.color }}
                            />
                            <span className="text-gray-700 font-medium">{stat.label}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-gray-600 min-w-[3rem] text-right">{stat.count}</span>
                            <span className="text-gray-900 font-semibold min-w-[4rem] text-right">{stat.percentage}%</span>
                          </div>
                        </div>
                      ))}
                      {/* Empty Space */}
                      {emptyPercentage > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-3 h-3 rounded-full bg-gray-300" />
                            <span className="text-gray-700 font-medium">Empty Space</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-gray-600 min-w-[3rem] text-right">-</span>
                            <span className="text-gray-900 font-semibold min-w-[4rem] text-right">{emptyPercentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Storage Progress Bar */}
                    <div className="border-t pt-6">
                      <div className="mb-4">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-2">{percentage}% completed</div>
                        <div className="text-gray-900 font-semibold">
                          Total Storage Used: {usageGB.toFixed(2)}GB
                        </div>
                        <div className="text-gray-600">
                          Remaining Storage: {remainingGB.toFixed(2)}GB
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Storage Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <HardDrive className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Storage</p>
                      <p className="text-2xl font-bold text-gray-900">{storageData.limit}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <File className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Used in Drive</p>
                      <p className="text-2xl font-bold text-gray-900">{usageGB.toFixed(2)} GB</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">In Trash</p>
                      <p className="text-2xl font-bold text-gray-900">{storageData.usageInDriveTrash}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Type Details Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">File Type Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Storage Used</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filePercentages.map((stat) => (
                        <tr key={stat.type} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: stat.color }}
                              />
                              <span className="text-sm font-medium text-gray-900">{stat.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{stat.count} files</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{stat.storage}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all"
                                  style={{ 
                                    width: `${stat.percentage}%`,
                                    backgroundColor: stat.color 
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{stat.percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;