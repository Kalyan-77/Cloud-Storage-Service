import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Upload, Download, Link2, Edit3, Trash2, MoreVertical, 
  File, FileText, Image, Video, Music, Archive, Grid3x3, List,
  Star, Clock, FolderOpen, Plus, Filter, ArrowUpDown, Eye,
  Share2, Heart, CheckCircle2, Circle, AlertCircle, RefreshCw
} from 'lucide-react';
import { BASE_URL } from '../../../config';

const HomeCloud = () => {
  const [files, setFiles] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [showDropdown, setShowDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [stats, setStats] = useState({
    totalFiles: 0,
    storageUsed: 0,
    starredFiles: 0,
    recentFiles: 0
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '', show: false });

  const API_BASE = `${BASE_URL}/cloud`;

  // File type mapping for categories
  const typeMapping = {
    'Documents': ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    'Images': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],
    'Videos': ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'],
    'Audio': ['mp3', 'wav', 'flac', 'aac', 'ogg'],
    'Archives': ['zip', 'rar', '7z', 'tar', 'gz']
  };

  const categories = [
    { name: 'All', icon: FolderOpen, count: stats.totalFiles },
    { name: 'Documents', icon: FileText, count: 0 },
    { name: 'Images', icon: Image, count: 0 },
    { name: 'Videos', icon: Video, count: 0 },
    { name: 'Audio', icon: Music, count: 0 },
    { name: 'Archives', icon: Archive, count: 0 }
  ];

  // Show notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  // Fetch all files
  const fetchFiles = useCallback(async () => {
  try {
    setLoading(true);
    const response = await fetch(`${API_BASE}/files`);
    if (!response.ok) throw new Error('Failed to fetch files');
    const data = await response.json();
    
    // Add local state properties and better data mapping
    const filesWithState = data.map(file => ({
      ...file,
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size || 0,
      isStarred: false,
      isPublic: false,
      // Fix date mapping - use proper fallback chain
      modifiedTime: file.modifiedTime || file.uploadedAt || file.createdTime || new Date().toISOString(),
      createdTime: file.createdTime || file.uploadedAt || new Date().toISOString()
    }));
    
    setFiles(filesWithState);
    setRecentFiles(filesWithState.slice(0, 6));
  } catch (error) {
    console.error('Error fetching files:', error);
    showNotification('Failed to load files', 'error');
  } finally {
    setLoading(false);
  }
}, [API_BASE, showNotification]);

// 3. Fix other fetch functions similarly
const fetchFilesByType = useCallback(async (type) => {
  try {
    setLoading(true);
    const response = await fetch(`${API_BASE}/files/type?type=${type}`);
    if (!response.ok) throw new Error('Failed to fetch files by type');
    const data = await response.json();
    
    const filesWithState = data.map(file => ({
      ...file,
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size || 0,
      isStarred: false,
      isPublic: false,
      // Fix date mapping
      modifiedTime: file.modifiedTime || file.uploadedAt || file.createdTime || new Date().toISOString(),
      createdTime: file.createdTime || file.uploadedAt || new Date().toISOString()
    }));
    
    setFiles(filesWithState);
  } catch (error) {
    console.error('Error fetching files by type:', error);
    showNotification('Failed to load files by type', 'error');
  } finally {
    setLoading(false);
  }
}, [API_BASE, showNotification]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const [filesCountRes, storageRes] = await Promise.all([
        fetch(`${API_BASE}/filesCount`),
        fetch(`${API_BASE}/totalStorage`)
      ]);

      if (filesCountRes.ok) {
        const filesCount = await filesCountRes.json();
        setStats(prev => ({
          ...prev,
          totalFiles: filesCount.totalFiles || filesCount.count || 0,
        }));
      }

      if (storageRes.ok) {
        const storage = await storageRes.json();
        setStats(prev => ({
          ...prev,
          storageUsed: storage.usage || storage.totalSize || '0 Bytes'
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [API_BASE]);

  // Search files
  const handleSearch = useCallback(async () => {
  if (!searchTerm.trim()) {
    fetchFiles();
    return;
  }
  
  try {
    setLoading(true);
    const response = await fetch(`${API_BASE}/search?name=${encodeURIComponent(searchTerm)}`);
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    
    const filesWithState = data.map(file => ({
      ...file,
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size || 0,
      isStarred: false,
      isPublic: false,
      // Fix date mapping
      modifiedTime: file.modifiedTime || file.uploadedAt || file.createdTime || new Date().toISOString(),
      createdTime: file.createdTime || file.uploadedAt || new Date().toISOString()
    }));
    
    setFiles(filesWithState);
  } catch (error) {
    console.error('Error searching files:', error);
    showNotification('Search failed', 'error');
  } finally {
    setLoading(false);
  }
}, [searchTerm, fetchFiles, API_BASE, showNotification]);


  // Upload file
  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingFile(true);
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      showNotification('File uploaded successfully!');
      fetchFiles();
      fetchStats();
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification('Failed to upload file', 'error');
    } finally {
      setUploadingFile(false);
      event.target.value = ''; // Reset file input
    }
  }, [API_BASE, fetchFiles, fetchStats, showNotification]);

  // Move file to trash (instead of permanent delete)
  const handleMoveToTrash = useCallback(async (fileId) => {
    if (!window.confirm('Are you sure you want to move this file to trash?')) return;

    try {
      const response = await fetch(`${API_BASE}/trash/${fileId}`, {
        method: 'PUT',
      });

      if (!response.ok) throw new Error('Move to trash failed');
      
      setFiles(prev => prev.filter(file => file.id !== fileId));
      setRecentFiles(prev => prev.filter(file => file.id !== fileId));
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      
      showNotification('File moved to trash successfully!');
      fetchStats();
    } catch (error) {
      console.error('Error moving file to trash:', error);
      showNotification('Failed to move file to trash', 'error');
    }
  }, [API_BASE, showNotification, fetchStats]);

  // Download file
  const handleDownloadFile = useCallback(async (fileId, fileName) => {
    try {
      const response = await fetch(`${API_BASE}/download/${fileId}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showNotification('Download started!');
    } catch (error) {
      console.error('Error downloading file:', error);
      showNotification('Failed to download file', 'error');
    }
  }, [API_BASE, showNotification]);

  // Generate shareable link
  const handleGenerateLink = useCallback(async (fileId) => {
    try {
      const response = await fetch(`${API_BASE}/generate-link/${fileId}`);
      if (!response.ok) throw new Error('Link generation failed');
      
      const data = await response.json();
      const linkToCopy = data.viewLink || data.link;
      await navigator.clipboard.writeText(linkToCopy);
      showNotification('Link copied to clipboard!');
    } catch (error) {
      console.error('Error generating link:', error);
      showNotification('Failed to generate link', 'error');
    }
  }, [API_BASE, showNotification]);

  // Make file public
  const handleMakePublic = useCallback(async (fileId) => {
    try {
      const response = await fetch(`${API_BASE}/public/${fileId}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to make file public');
      
      // Update local state
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, isPublic: true } : file
      ));
      
      showNotification('File made public!');
    } catch (error) {
      console.error('Error making file public:', error);
      showNotification('Failed to make file public', 'error');
    }
  }, [API_BASE, showNotification]);

  // Update file name
  const handleRenameFile = useCallback(async (fileId, newName) => {
    try {
      const response = await fetch(`${API_BASE}/updateFileName/${fileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) throw new Error('Rename failed');
      
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, name: newName } : file
      ));
      
      showNotification('File renamed successfully!');
    } catch (error) {
      console.error('Error renaming file:', error);
      showNotification('Failed to rename file', 'error');
    }
  }, [API_BASE, showNotification]);

  // Initialize data on mount
  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, [fetchFiles, fetchStats]);

  // Handle category changes
  useEffect(() => {
    if (activeCategory === 'All') {
      fetchFiles();
    } else {
      fetchFiles();
    }
  }, [activeCategory, fetchFiles]);

  // Get file type from name
  const getFileTypeFromName = useCallback((fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    for (const [category, extensions] of Object.entries(typeMapping)) {
      if (extensions.includes(extension)) {
        return category.toLowerCase();
      }
    }
    return 'other';
  }, []);

  // Filter files based on category and search
  const filteredFiles = useMemo(() => {
    let filtered = files;

    // Filter by category
    if (activeCategory !== 'All') {
      filtered = filtered.filter(file => {
        const fileType = getFileTypeFromName(file.name);
        return fileType === activeCategory.toLowerCase();
      });
    }

    // Filter by search term
    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort files
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (sortBy === 'size') {
        aValue = parseInt(a.size) || 0;
        bValue = parseInt(b.size) || 0;
      } else if (sortBy === 'modifiedTime') {
        aValue = new Date(a.modifiedTime).getTime();
        bValue = new Date(b.modifiedTime).getTime();
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [files, activeCategory, searchTerm, sortBy, sortOrder, getFileTypeFromName]);

  const handleFileSelect = useCallback((fileId) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  }, [filteredFiles, selectedFiles.size]);

  const handleStarFile = useCallback((fileId) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, isStarred: !file.isStarred } : file
    ));
  }, []);

  const getFileIcon = useCallback((fileName, type) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    const iconProps = { className: "w-6 h-6" };
    
    if (typeMapping.Documents.includes(extension)) {
      return <FileText {...iconProps} className="w-6 h-6 text-blue-600" />;
    } else if (typeMapping.Images.includes(extension)) {
      return <Image {...iconProps} className="w-6 h-6 text-green-600" />;
    } else if (typeMapping.Videos.includes(extension)) {
      return <Video {...iconProps} className="w-6 h-6 text-purple-600" />;
    } else if (typeMapping.Audio.includes(extension)) {
      return <Music {...iconProps} className="w-6 h-6 text-pink-600" />;
    } else if (typeMapping.Archives.includes(extension)) {
      return <Archive {...iconProps} className="w-6 h-6 text-yellow-600" />;
    } else {
      return <File {...iconProps} className="w-6 h-6 text-gray-600" />;
    }
  }, []);

  const formatFileSize = useCallback((size) => {
    if (!size || size === 0 || size === '0') return '0 B';
    
    // If size is already formatted as string (from API), return as is
    if (typeof size === 'string' && size.includes(' ')) return size;
    
    // Convert bytes to human readable
    const bytes = parseInt(size);
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

const formatDate = useCallback((dateString) => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', dateString);
    return 'Unknown';
  }
  
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Changed to Math.floor
  
  // More granular time formatting
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}, []);

  // Enhanced dropdown positioning
  const getDropdownPosition = (index, totalFiles) => {
    const isNearBottom = index >= totalFiles - 2;
    return isNearBottom ? 'bottom-12 right-4' : 'top-12 right-4';
  };

  const FileCard = ({ file, index }) => (
    <div className={`group relative bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
      selectedFiles.has(file.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
    }`}>
      <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-200" />
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <button
            onClick={() => handleFileSelect(file.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            {selectedFiles.has(file.id) ? 
              <CheckCircle2 className="w-5 h-5 text-blue-600" /> : 
              <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600" />
            }
          </button>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => handleStarFile(file.id)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <Star className={`w-4 h-4 ${file.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
            </button>
            <button
              onClick={() => setShowDropdown(showDropdown === file.id ? null : file.id)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center h-16 mb-4 bg-gray-50 rounded-lg">
          {getFileIcon(file.name)}
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-gray-900 truncate text-sm" title={file.name}>
            {file.name}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatFileSize(file.size)}</span>
            <span>{formatDate(file.modifiedTime)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {file.isPublic && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                <Share2 className="w-3 h-3 mr-1" />
                Public
              </span>
            )}
          </div>
          {file.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
        </div>
      </div>

      {showDropdown === file.id && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(null)} />
          <div className={`absolute ${getDropdownPosition(index, recentFiles.length)} w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden`}>
          <button 
            onClick={() => {
              setShowDropdown(null);
              handleDownloadFile(file.id, file.name);
            }}
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
          >
            <Download className="w-4 h-4 mr-3" />
            Download
          </button>
          <button 
            onClick={() => {
              setShowDropdown(null);
              handleGenerateLink(file.id);
            }}
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
          >
            <Link2 className="w-4 h-4 mr-3" />
            Get Link
          </button>
          <button 
            onClick={() => {
              setShowDropdown(null);
              const newName = prompt('Enter new name:', file.name);
              if (newName && newName.trim() && newName !== file.name) {
                handleRenameFile(file.id, newName.trim());
              }
            }}
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
          >
            <Edit3 className="w-4 h-4 mr-3" />
            Rename
          </button>
          <button 
            onClick={() => {
              setShowDropdown(null);
              handleMakePublic(file.id);
            }}
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
          >
            <Share2 className="w-4 h-4 mr-3" />
            Make Public
          </button>
          <div className="border-t border-gray-100">
            <button 
              onClick={() => {
                setShowDropdown(null);
                handleMoveToTrash(file.id);
              }}
              className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-3" />
              Move to Trash
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );

  const FileListItem = ({ file, index }) => (
    <div className={`flex items-center py-3 px-4 hover:bg-gray-50 transition-colors group ${
      selectedFiles.has(file.id) ? 'bg-blue-50' : ''
    }`}>
      <button
        onClick={() => handleFileSelect(file.id)}
        className="mr-4 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {selectedFiles.has(file.id) ? 
          <CheckCircle2 className="w-5 h-5 text-blue-600" /> : 
          <Circle className="w-5 h-5 text-gray-400" />
        }
      </button>
      
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {getFileIcon(file.name)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
              {file.name}
            </p>
            {file.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
            {file.isPublic && <Share2 className="w-4 h-4 text-green-600 flex-shrink-0" />}
          </div>
        </div>
        
        <div className="hidden sm:block text-sm text-gray-500 w-20 text-right">
          {formatFileSize(file.size)}
        </div>
        
        <div className="hidden md:block text-sm text-gray-500 w-32 text-right">
          {formatDate(file.modifiedTime)}
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowDropdown(showDropdown === file.id ? null : file.id)}
            className="p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          
          {showDropdown === file.id && (
            <div className={`absolute ${getDropdownPosition(index, filteredFiles.length)} w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-30 overflow-hidden`}>
              <button 
                onClick={() => {
                  setShowDropdown(null);
                  handleDownloadFile(file.id, file.name);
                }}
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
              >
                <Download className="w-4 h-4 mr-3" />
                Download
              </button>
              <button 
                onClick={() => {
                  setShowDropdown(null);
                  handleGenerateLink(file.id);
                }}
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
              >
                <Link2 className="w-4 h-4 mr-3" />
                Get Link
              </button>
              <button 
                onClick={() => {
                  setShowDropdown(null);
                  const newName = prompt('Enter new name:', file.name);
                  if (newName && newName.trim() && newName !== file.name) {
                    handleRenameFile(file.id, newName.trim());
                  }
                }}
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-3" />
                Rename
              </button>
              <button 
                onClick={() => {
                  setShowDropdown(null);
                  handleMakePublic(file.id);
                }}
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
              >
                <Share2 className="w-4 h-4 mr-3" />
                Make Public
              </button>
              <div className="border-t border-gray-100">
                <button 
                  onClick={() => {
                    setShowDropdown(null);
                    handleMoveToTrash(file.id);
                  }}
                  className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Move to Trash
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border flex items-center space-x-2 transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {notification.type === 'success' ? 
            <CheckCircle2 className="w-5 h-5" /> : 
            <AlertCircle className="w-5 h-5" />
          }
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Drive
              </h1>
              {selectedFiles.size > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {selectedFiles.size} selected
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={uploadingFile}
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center p-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg cursor-pointer ${
                    uploadingFile ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingFile ? (
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 mr-2" />
                  )}
                  {uploadingFile ? 'Uploading...' : 'Upload'}
                </label>
              </div>
            </div>
          </div>
        </div>
      </header> */}

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4 w-full max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Recently Uploaded Files */}
        {recentFiles.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-blue-600" />
                  Recently Uploaded
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {recentFiles.slice(0, 8).map((file, index) => (
                    <div key={file.id} className="group relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-center h-12 mb-3">
                        {getFileIcon(file.name)}
                      </div>
                      <div className="text-center">
                        <h4 className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                          {file.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                        <p className="text-xs text-gray-400">{formatDate(file.modifiedTime)}</p>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setShowDropdown(showDropdown === file.id ? null : file.id)}
                          className="p-1 rounded-full hover:bg-white shadow-sm"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      
                      {showDropdown === file.id && (
                        <div className={`absolute ${getDropdownPosition(index, recentFiles.length)} w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-30 overflow-hidden`}>
                          <button 
                            onClick={() => {
                              setShowDropdown(null);
                              handleDownloadFile(file.id, file.name);
                            }}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                          >
                            <Download className="w-4 h-4 mr-3" />
                            Download
                          </button>
                          <button 
                            onClick={() => {
                              setShowDropdown(null);
                              handleGenerateLink(file.id);
                            }}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                          >
                            <Link2 className="w-4 h-4 mr-3" />
                            Get Link
                          </button>
                          <div className="border-t border-gray-100">
                            <button 
                              onClick={() => {
                                setShowDropdown(null);
                                handleMoveToTrash(file.id);
                              }}
                              className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-3" />
                              Move to Trash
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.name;
                  const categoryCount = category.name === 'All' 
                    ? stats.totalFiles 
                    : filteredFiles.filter(f => getFileTypeFromName(f.name) === category.name.toLowerCase()).length;
                  
                  return (
                    <button
                      key={category.name}
                      onClick={() => setActiveCategory(category.name)}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mb-2 ${
                        isActive ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className={`text-xs mt-1 px-2 py-1 rounded-full ${
                        isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {categoryCount} files
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Controls Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSelectAll}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedFiles.size > 0
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {selectedFiles.size === filteredFiles.length && filteredFiles.length > 0 ? (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      ) : (
                        <Circle className="w-4 h-4 mr-2" />
                      )}
                      Select All
                    </button>
                    
                    {selectedFiles.size > 0 && (
                      <button
                        onClick={() => {
                          selectedFiles.forEach(fileId => {
                            handleMoveToTrash(fileId);
                          });
                        }}
                        className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Move to Trash
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="size">Sort by Size</option>
                      <option value="modifiedTime">Sort by Date</option>
                    </select>
                    
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                      title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                      <ArrowUpDown className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {filteredFiles.length} of {stats.totalFiles} files • {stats.storageUsed}
                  </span>
                  
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Files Display */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-lg text-gray-600">Loading files...</span>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <FolderOpen className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'No files found' : 'No files yet'}
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    {searchTerm
                      ? `No files match "${searchTerm}". Try a different search term.`
                      : 'Upload your first file to get started with cloud storage.'}
                  </p>
                  {!searchTerm && (
                    <label
                      htmlFor="file-upload"
                      className="mt-6 flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Upload File
                    </label>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredFiles.map((file, index) => (
                      <FileCard key={file.id} file={file} index={index} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  <div className="px-4 py-3 bg-gray-50 flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <div className="flex-1">Name</div>
                    <div className="hidden sm:block w-20 text-right">Size</div>
                    <div className="hidden md:block w-32 text-right">Modified</div>
                    <div className="w-8"></div>
                  </div>
                  {filteredFiles.map((file, index) => (
                    <FileListItem key={file.id} file={file} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>  
  );
};

export default HomeCloud;