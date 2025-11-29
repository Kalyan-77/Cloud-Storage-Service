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
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50 ml-64 h-screen overflow-y-auto">
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
      </main>
    </div>
  );
};

export default Cloud;
