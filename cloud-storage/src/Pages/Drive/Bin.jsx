import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Trash2, RotateCcw, Download, Eye, AlertCircle, Clock, 
  FileText, Image, Video, Music, Archive, File, Search,
  RefreshCw, CheckCircle2, Circle, X
} from 'lucide-react';

import { BASE_URL } from '../../../config';

const Bin = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // File type mapping for icons
  const typeMapping = {
    'Documents': ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    'Images': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],
    'Videos': ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'],
    'Audio': ['mp3', 'wav', 'flac', 'aac', 'ogg'],
    'Archives': ['zip', 'rar', '7z', 'tar', 'gz']
  };

  // Show notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/cloud/bin`, {
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Failed to fetch files');
      
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('Fetch error: ', err);
      setFiles([]);
      showNotification('Failed to load files from bin', 'error');
    } finally {
      setLoading(false);
    }
  };

  const restoreFile = async (fileId) => {
    try {
      const response = await fetch(`${BASE_URL}/cloud/restore/${fileId}/`, {
        method: 'PUT',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Restore failed');
      
      showNotification('File restored successfully!');
      fetchFiles();
      
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    } catch (err) {
      console.log(err);
      showNotification('Failed to restore file', 'error');
    }
  };

  const deleteFilePermanently = async (fileId) => {
    try {
      const response = await fetch(`${BASE_URL}/cloud/deletefiles/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Delete failed');
      
      showNotification('File deleted permanently');
      fetchFiles();
      
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    } catch (err) {
      console.log(err);
      showNotification('Failed to delete file', 'error');
    }
  };

  const handleBulkRestore = async () => {
    if (selectedFiles.size === 0) return;
    
    try {
      await Promise.all(Array.from(selectedFiles).map(fileId => restoreFile(fileId)));
      setSelectedFiles(new Set());
      showNotification(`${selectedFiles.size} files restored successfully!`);
    } catch (error) {
      showNotification('Some files failed to restore', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    
    setShowDeleteConfirm({ isBulk: true, count: selectedFiles.size });
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(Array.from(selectedFiles).map(fileId => deleteFilePermanently(fileId)));
      setSelectedFiles(new Set());
      showNotification(`${selectedFiles.size} files deleted permanently`);
      setShowDeleteConfirm(null);
    } catch (error) {
      showNotification('Some files failed to delete', 'error');
    }
  };

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
  }, [selectedFiles.size]);

  // Get file icon based on extension
  const getFileIcon = useCallback((fileName, mimeType) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    const iconProps = { className: "w-8 h-8" };
    
    if (typeMapping.Documents.includes(extension)) {
      return <FileText {...iconProps} className="w-8 h-8 text-blue-600" />;
    } else if (typeMapping.Images.includes(extension)) {
      return <Image {...iconProps} className="w-8 h-8 text-green-600" />;
    } else if (typeMapping.Videos.includes(extension)) {
      return <Video {...iconProps} className="w-8 h-8 text-purple-600" />;
    } else if (typeMapping.Audio.includes(extension)) {
      return <Music {...iconProps} className="w-8 h-8 text-pink-600" />;
    } else if (typeMapping.Archives.includes(extension)) {
      return <Archive {...iconProps} className="w-8 h-8 text-yellow-600" />;
    } else {
      return <File {...iconProps} className="w-8 h-8 text-gray-600" />;
    }
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }, []);

  // Filter files based on search
  const filteredFiles = useMemo(() => {
    if (!searchTerm.trim()) return files;
    
    return files.filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [files, searchTerm]);

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Notification Toast */}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Permanently</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    {showDeleteConfirm.isBulk 
                      ? `You are about to permanently delete ${showDeleteConfirm.count} ${showDeleteConfirm.count === 1 ? 'file' : 'files'}. This action cannot be undone.`
                      : `You are about to permanently delete this file. This action cannot be undone.`
                    }
                  </span>
                </p>
              </div>

              <p className="text-gray-700">
                {showDeleteConfirm.isBulk ? (
                  <>Are you sure you want to permanently delete <strong>{showDeleteConfirm.count}</strong> selected {showDeleteConfirm.count === 1 ? 'file' : 'files'}?</>
                ) : (
                  <>Are you sure you want to permanently delete "<strong>{showDeleteConfirm.name}</strong>"?</>
                )}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showDeleteConfirm.isBulk) {
                    confirmBulkDelete();
                  } else {
                    deleteFilePermanently(showDeleteConfirm.id);
                    setShowDeleteConfirm(null);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Bin</h1>
                  <p className="text-gray-500 mt-1">
                    {files.length} {files.length === 1 ? 'file' : 'files'} in bin
                    {selectedFiles.size > 0 && ` • ${selectedFiles.size} selected`}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={fetchFiles}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Warning Banner */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-amber-800">Items in Bin</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Files in the bin will be automatically deleted after 30 days. You can restore them or delete them permanently.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        {files.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search files in bin..."
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Select All */}
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
                </div>

                {/* Bulk Actions */}
                {selectedFiles.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleBulkRestore}
                      className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restore ({selectedFiles.size})
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Permanently ({selectedFiles.size})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Files Display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-lg text-gray-600">Loading files...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Trash2 className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No files found' : 'Bin is empty'}
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                {searchTerm
                  ? `No files in bin match "${searchTerm}". Try a different search term.`
                  : 'Items you delete will appear here. You can restore them or delete them permanently.'}
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`group relative bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                      selectedFiles.has(file.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="p-4">
                      {/* Selection and Actions */}
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
                          {file.viewLink && (
                            <a
                              href={file.viewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-full hover:bg-gray-100"
                              title="View file"
                            >
                              <Eye className="w-4 h-4 text-gray-500" />
                            </a>
                          )}
                          {file.downloadLink && (
                            <a
                              href={file.downloadLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-full hover:bg-gray-100"
                              title="Download file"
                            >
                              <Download className="w-4 h-4 text-gray-500" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* File Icon */}
                      <div className="flex items-center justify-center h-16 mb-4 bg-gray-50 rounded-lg">
                        {getFileIcon(file.name, file.mimeType)}
                      </div>

                      {/* File Info */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-900 truncate text-sm" title={file.name}>
                          {file.name}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>Deleted {formatDate(file.uploadedAt)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 space-x-2">
                        <button
                          onClick={() => restoreFile(file.id)}
                          className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Restore
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm({ id: file.id, name: file.name, isBulk: false })}
                          className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bin;