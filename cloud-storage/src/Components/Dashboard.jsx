import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CloudStorageNavbar from '../Pages/Dashboard/Navbar';
import Home from '../Pages/Dashboard/Home';
import Profile from '../Pages/Dashboard/Profile';
import Cloud from './CloudPage';
import ConfigPage from './ConfigPage';
import StorageTracking from '../Pages/Dashboard/StorageTracking';
import Settings from '../Pages/Dashboard/Settings';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <CloudStorageNavbar />

      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/configure/*" element={<ConfigPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cloud/*" element={<Cloud />} />
          <Route path='/storagetracking' element={<StorageTracking />} />
          <Route path='/settings' element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;