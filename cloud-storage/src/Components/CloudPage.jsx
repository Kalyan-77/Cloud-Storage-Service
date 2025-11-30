import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../Pages/Drive/Sidebar';
import HomeCloud from '../Pages/Drive/HomeCloud';
import Mac from '../Pages/Drive/Mac';
import Starred from '../Pages/Drive/Starred';
import Spam from '../Pages/Drive/Spam';
import Bin from '../Pages/Drive/Bin';
import Storage from '../Pages/Drive/Storage';

const Cloud = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 w-full lg:ml-72 min-h-screen overflow-y-auto">
        {/* Content wrapper with responsive padding */}
        <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-6">
          <Routes>
            {/* When user visits /dashboard/cloud -> show HomeCloud */}
            <Route index element={<HomeCloud />} />

            {/* Sub-routes */}
            <Route path="mac" element={<Mac />} />
            <Route path="starred" element={<Starred />} />
            <Route path="spam" element={<Spam />} />
            <Route path="bin" element={<Bin />} />
            <Route path="storage" element={<Storage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Cloud;