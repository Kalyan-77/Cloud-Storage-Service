import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../../Context/AuthContext';
import { BASE_URL } from '../../../../config';

const ApiConfig = () => {
  const { user } = useAuth();
  
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  // Fetch existing configuration on mount
  useEffect(() => {
    if (user?._id) {
      fetchConfig();
    }
  }, [user]);

  const fetchConfig = async () => {
    if (!user?._id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/config/get/${user._id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.perplexity_API_exists) {
          setHasExistingKey(true);
          setApiKey(''); // Don't populate the field for security
        }
      } else if (response.status === 404) {
        console.log('No configuration found, starting fresh');
      }
    } catch (err) {
      console.error('Error fetching config:', err);
      setError('Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?._id) {
      setError('Please log in to save API key');
      return;
    }

    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    // Basic validation for Perplexity API key format
    if (!apiKey.startsWith('pplx-')) {
      setError('Invalid API key format. Perplexity API keys start with "pplx-"');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/config/save/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          perplexity_API: apiKey
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSaved(true);
        setHasExistingKey(true);
        setApiKey(''); // Clear the input after successful save
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        setError(data.message || 'Failed to save API key');
      }
    } catch (err) {
      console.error('Error saving API key:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to configure API settings</p>
          <a href="/login" className="text-blue-600 hover:underline">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Key className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">API Configuration</h1>
              <p className="text-sm text-gray-500">Manage your Perplexity API integration</p>
            </div>
          </div>

          {/* Success Alert */}
          {isSaved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">API Key Saved Successfully!</p>
                <p>Your Perplexity API key has been securely stored.</p>
              </div>
            </div>
          )}

          {/* Status Alert */}
          {hasExistingKey && !isSaved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">API Key Configured</p>
                <p>Your Perplexity API key is already set up. Enter a new key below to update it.</p>
              </div>
            </div>
          )}

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Secure API Key Storage</p>
              <p>Your API key will be encrypted and stored securely. Never share your API key with others.</p>
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                Perplexity API Key {hasExistingKey && <span className="text-green-600">(Configured)</span>}
              </label>
              <div className="relative">
                <input
                  id="apiKey"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setError('');
                  }}
                  placeholder={hasExistingKey ? "Enter new key to update" : "pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Get your API key from{' '}
                <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Perplexity Settings
                </a>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Save Button */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={!apiKey.trim() || isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {hasExistingKey ? 'Update API Key' : 'Save API Key'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">How to get your API key:</h3>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Visit <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">perplexity.ai/settings/api</span></li>
              <li>Sign in to your Perplexity account</li>
              <li>Generate a new API key in the API section</li>
              <li>Copy and paste the key above</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiConfig;