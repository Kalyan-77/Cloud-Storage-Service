import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../Pages/Hero/HeroNavbar';
import HeroBody from '../Pages/Hero/HeroBody';

const HeroPage = () => {
  return (
    <div>
      {/* Navbar always visible */}
      <Navbar />

      {/* Routes only for Hero pages */}
      <Routes>
        <Route path="/" element={<HeroBody />} />
      </Routes>
    </div>
  );
};

export default HeroPage;
