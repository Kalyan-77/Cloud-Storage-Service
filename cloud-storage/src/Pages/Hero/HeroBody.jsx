import React from 'react';
import cloud from '../../assets/cloud.png';

const HeroBody = () => {
  return (
    <div className="min-h-screen bg-white">
      <br/>
      <br/>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-800 via-blue-700 to-blue-400 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Your Files. Your Cloud. Your Control.
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Store, manage, and access your data securely — locally or in the cloud.
                Choose between Google Drive or Local Storage, or even host your website's assets.
              </p>
              <div className="flex space-x-4">
                <a href='/dashboardHome'>
                  <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
                    Get Started With MyCloud
                  </button>
                </a>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors cursor-pointer">
                  Explore Cloud
                </button>
              </div>
            </div>
            
            {/* Right Content - Hero Illustration */}
            <div className="relative">
              <div className="w-full h-96 rounded-3xl flex items-center justify-center">
                <img 
                  src={cloud} 
                  alt="Cloud Storage Hero" 
                  className="w-full h-full object-cover rounded-3xl"
                />
                <div className="text-white/70 text-center">
                  {/* Placeholder content if needed */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore the features in the Cloud Storage
            </h2>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {/* Feature Card 1 - Smart Editor */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <img 
                  src="https://cdn.neowin.com/news/images/uploaded/2024/05/1716439397_apple_logo_dark.jpg" 
                  alt="Smart Editor" 
                  className="w-10 h-10 rounded"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Smart Editor (Mac UI)</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                An intelligent Mac-style UI environment to edit your files efficiently from the cloud.
              </p>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center cursor-not-allowed">
                Launch Editor
                <span className="ml-1">→</span>
              </button>
            </div>

            {/* Feature Card 2 - Google Drive Sync */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwGJPIfRBBM0Tw09Coi_bnWeOk9o7vlIQMz5xIkyvjrG-esq5ItI5e8rtXmZxuyNV1D0c&usqp=CAU" 
                  alt="Google Drive" 
                  className="w-10 h-10 rounded"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Google Drive Sync</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Connect your drive with one click. Allows seamless data upload files directly to your Cloud Storage Files folder.
              </p>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center cursor-not-allowed">
                Sync with Google Drive
                <span className="ml-1">→</span>
              </button>
            </div>

            {/* Feature Card 3 - File Manager */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQO6yNK__mGcE1fafaCvWxJjw6dS1ydyHxIvQ&s" 
                  alt="File Manager" 
                  className="w-10 h-10"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">File Manager</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                All your files in one place. Organize, share, and access on-cloud and cloud storage with powerful and filtering options.
              </p>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center cursor-not-allowed">
                Go to File Manager
                <span className="ml-1">→</span>
              </button>
            </div>

            {/* Feature Card 4 - CloudSync Drive */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow rounded-full flex items-center justify-center mb-4">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/10644/10644948.png" 
                  alt="CloudSync" 
                  className="w-10 h-10"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">CloudSync Drive</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Secure and seamless cloud storage. Upload, manage, and share files instantly from any device, anywhere in the world.
              </p>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center cursor-not-allowed">
                Explore the Features 
                <span className="ml-1">→</span>
              </button>
            </div>

            {/* Feature Card 5 - Cloud Buckets */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <img 
                  src="https://img.favpng.com/7/23/13/amazon-s3-amazon-com-amazon-web-services-bucket-cloud-computing-png-favpng-7JfYfYS2BRjm5D8pngA2Z0yFT.jpg" 
                  alt="Cloud Buckets" 
                  className="w-10 h-10"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cloud Buckets</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Create custom file containers. Use bucket-based storage for projects, media files, backups, and more using the AWS S3 or Azure Blob.
              </p>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center cursor-not-allowed">
                Create a Bucket
                <span className="ml-1">→</span>
              </button>
            </div>

            {/* Feature Card 6 - Admin Dashboard */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <img 
                  src="https://t3.ftcdn.net/jpg/00/65/75/68/360_F_65756860_GUZwzOKNMUU3HldFoIA44qss7ZIrCG8I.jpg" 
                  alt="Admin Dashboard" 
                  className="w-10 h-10"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Dashboard</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Monitor usage and manage cost. View logs, file counts, and user activity analytics with complete security.
              </p>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center cursor-not-allowed">
                Open Dashboard
                <span className="ml-1">→</span>
              </button>
            </div>
          </div>

          {/* Migration Section */}
          <div className="bg-white rounded-3xl p-12 shadow-sm border">
            <div className="flex items-center justify-center space-x-12">
              {/* Left Image - Google Drive Style Logo */}
              <div className="relative">
                <img 
                  src="google-drive-logo.png" 
                  alt="Google Drive Logo" 
                  className="w-32 h-32 object-contain"
                  style={{ display: 'none' }}
                />
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 via-yellow-400 via-orange-400 to-red-400 rounded-full flex items-center justify-center">
                  <div className="text-white text-xs text-center">
                    <div>Google Drive</div>
                    <div>Logo</div>
                  </div>
                </div>
              </div>
              
              {/* Arrow */}
              <div className="flex flex-col items-center">
                <div className="text-6xl text-gray-400 font-light">→</div>
                <div className="text-sm text-gray-500 mt-2">Migrate</div>
              </div>
              
              {/* Right Image - Cloud Logo */}
              <div className="relative">
                <img 
                  src="cloud-storage-logo.png" 
                  alt="Cloud Storage Logo" 
                  className="w-32 h-32 object-contain"
                  style={{ display: 'none' }}
                />
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <div className="text-white text-xs text-center">
                    <div>Cloud</div>
                    <div>Storage</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-600">Seamlessly migrate your existing files to the cloud with one-click transfer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose MyCloud Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose MyCloud?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful cloud storage designed for students, developers, and teams.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Access Anywhere */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="text-white text-2xl">📱</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Access Anywhere</h3>
              <p className="text-gray-600 leading-relaxed">
                Access your files, documents, and images on any device — desktop, laptop, or mobile app.
              </p>
            </div>

            {/* Your Own Cloud */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="text-white text-2xl">☁️</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Own Cloud</h3>
              <p className="text-gray-600 leading-relaxed">
                Experience a personal cloud storage solution giving you full control over your data.
              </p>
            </div>

            {/* MacOS-Like Environment */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="text-white text-2xl">💻</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">MacOS-Like Environment</h3>
              <p className="text-gray-600 leading-relaxed">
                Perform MacOS-like tasks without an OS — terminal, file system, VLC, VSCode, and other apps directly in the browser.
              </p>
            </div>

            {/* Configurable Storage */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="text-white text-2xl">⚙️</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Configurable Storage</h3>
              <p className="text-gray-600 leading-relaxed">
                Choose where to store your data — locally, Google Drive, or other cloud options.
              </p>
            </div>

            {/* Real-Time File Manager */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="text-white text-2xl">📁</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time File Manager</h3>
              <p className="text-gray-600 leading-relaxed">
                Manage your files in real-time with full CRUD operations and seamless Google Drive integration.
              </p>
            </div>

            {/* Additional Card for Visual Balance */}
            {/* <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="text-white text-2xl">🚀</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Started Today</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Ready to experience the power of MyCloud? Join thousands of users who trust us with their data.
              </p>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                Start Free Trial
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xl">☁</span>
                </div>
                <span className="text-2xl font-bold">MyCloud</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Secure, reliable, and easy-to-use cloud storage solution for individuals, teams, and enterprises. 
                Your files, your cloud, your control.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">f</div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">t</div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">in</div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">@</div>
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">File Manager</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Google Drive Sync</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Cloud Buckets</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Smart Editor</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Admin Dashboard</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Status Page</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 MyCloud. All rights reserved.
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">GDPR</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HeroBody;