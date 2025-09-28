import React from 'react'
import { Upload, HardDrive, FileText, RotateCcw, BarChart3, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../Context/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

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
      description: 'Role based File Organization(ppt,pdf,word, etc...)',
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
      path: '/dashboard/cloud'
    }
  ]

  const handleServiceClick = (path) => {
    navigate(path)
  }

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
        <div>
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
      </div>
    </div>
  )
}

export default Dashboard