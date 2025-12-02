import React, { useState, useEffect } from 'react';
import { HardDrive, File, Trash2, RefreshCw, TrendingUp, Database, Folder, AlertCircle } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { BASE_URL } from '../../../config';
import loadingGif from '../../assets/loading.gif';

const StorageTracking = () => {
  const { user } = useAuth();
  
  const [storageData, setStorageData] = useState({
    usage: '0 GB',
    limit: '0 GB',
    usageInDrive: '0 GB',
    usageInDriveTrash: '0 GB'
  });
  const [fileStats, setFileStats] = useState([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(true);

  const fileTypes = [
    { type: 'pptx', label: 'PPTs', color: '#10B981', icon: '📊' },
    { type: 'pdf', label: 'PDFs', color: '#3B82F6', icon: '📄' },
    { type: 'docx', label: 'Word', color: '#F59E0B', icon: '📝' },
    { type: 'png', label: 'Images', color: '#EC4899', icon: '🖼️' },
    { type: 'mp4', label: 'Videos', color: '#8B5CF6', icon: '🎥' },
    { type: 'mp3', label: 'Music', color: '#06B6D4', icon: '🎵' },
    { type: 'txt', label: 'Text Files', color: '#EF4444', icon: '📋' },
    { type: 'xlsx', label: 'Spreadsheets', color: '#64748B', icon: '📈' }
  ];

  useEffect(() => {
    fetchStorageDetails();
  }, []);

  const fetchStorageDetails = async () => {
    setLoading(true);
    try {
      const storageRes = await fetch(`${BASE_URL}/cloud/totalStorage`);
      const storageJson = await storageRes.json();
      setStorageData(storageJson);

      const countRes = await fetch(`${BASE_URL}/cloud/filesCount`);
      const countJson = await countRes.json();
      setTotalFiles(countJson.totalFiles || 0);

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
            icon: ft.icon,
            count: countData.totalFiles || 0,
            storage: storageData.storage || '0 B'
          };
        } catch (err) {
          return {
            type: ft.type,
            label: ft.label,
            color: ft.color,
            icon: ft.icon,
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

  const totalUsedPercentage = filePercentages.reduce((acc, stat) => acc + parseFloat(stat.percentage), 0);
  const emptyPercentage = 100 - totalUsedPercentage;

  const getStorageStatus = () => {
    if (percentage >= 90) return { text: 'Critical', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (percentage >= 75) return { text: 'High Usage', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    if (percentage >= 50) return { text: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { text: 'Healthy', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
  };

  const status = getStorageStatus();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <img 
          src={loadingGif} 
          alt="Loading..." 
          className="w-44 h-44 mb-4"
        />
        <p className="text-gray-600 text-lg">Loading storage details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Storage Progress Tracking</h1>
              <p className="text-gray-600">Monitor and manage your storage usage</p>
            </div>
            <button
              onClick={fetchStorageDetails}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Status Alert */}
        <div className={`${status.bg} ${status.border} border rounded-lg p-4 mb-6`}>
          <div className="flex items-center gap-3">
            <AlertCircle className={`w-5 h-5 ${status.color}`} />
            <div>
              <p className={`font-semibold ${status.color}`}>Storage Status: {status.text}</p>
              <p className="text-sm text-gray-600 mt-1">
                {percentage >= 90 
                  ? 'Your storage is almost full. Consider deleting unnecessary files.'
                  : percentage >= 75
                  ? 'You are using a significant amount of storage. Monitor your usage.'
                  : 'Your storage usage is within normal limits.'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Storage Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <span className={`text-2xl font-bold ${status.color}`}>{percentage}%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Storage Used</h3>
            <p className="text-2xl font-bold text-gray-900">{usageGB.toFixed(2)} GB</p>
            <p className="text-sm text-gray-500 mt-1">of {limitGB.toFixed(2)} GB</p>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <HardDrive className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Available Storage</h3>
            <p className="text-2xl font-bold text-gray-900">{remainingGB.toFixed(2)} GB</p>
            <p className="text-sm text-gray-500 mt-1">{(100 - percentage).toFixed(1)}% remaining</p>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                style={{ width: `${100 - percentage}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <File className="w-6 h-6 text-purple-600" />
              </div>
              <Folder className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Files</h3>
            <p className="text-2xl font-bold text-gray-900">{totalFiles}</p>
            <p className="text-sm text-gray-500 mt-1">Across all types</p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Drive: {storageData.usageInDrive}</span>
                <span>Trash: {storageData.usageInDriveTrash}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-8">Storage Distribution by File Type</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donut Chart */}
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
                        className="transition-all hover:opacity-80 cursor-pointer"
                      />
                    );
                  })}
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
                    />
                  )}
                  <circle cx="100" cy="100" r="45" fill="white" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Total</div>
                    <div className="text-3xl font-bold text-gray-900">{totalFiles}</div>
                    <div className="text-xs text-gray-500">files</div>
                  </div>
                </div>
              </div>
            </div>

            {/* File Type List */}
            <div className="space-y-3">
              {filePercentages.map((stat) => (
                <div key={stat.type} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{stat.icon}</span>
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: stat.color }}
                    />
                    <span className="text-gray-700 font-medium">{stat.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600 text-sm">{stat.storage}</span>
                    <span className="text-gray-600 min-w-[3rem] text-right">{stat.count}</span>
                    <span className="text-gray-900 font-semibold min-w-[4rem] text-right">{stat.percentage}%</span>
                  </div>
                </div>
              ))}
              {emptyPercentage > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border-t pt-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">📦</span>
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                    <span className="text-gray-700 font-medium">Empty Space</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600 text-sm">-</span>
                    <span className="text-gray-600 min-w-[3rem] text-right">-</span>
                    <span className="text-gray-900 font-semibold min-w-[4rem] text-right">{emptyPercentage.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Storage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filePercentages.map((stat) => (
            <div key={stat.type} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{stat.icon}</span>
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: stat.color }}
                >
                  {stat.count}
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{stat.label}</h4>
              <p className="text-sm text-gray-500 mb-2">{stat.storage}</p>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${stat.percentage}%`,
                    backgroundColor: stat.color 
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">{stat.percentage}% of total files</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StorageTracking;