import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import CloudStorageNavbar from '../Pages/Dashboard/Navbar'; 
import Home from '../Pages/Dashboard/Home';
import Configure from '../Pages/Dashboard/Configure';
import Profile from '../Pages/Dashboard/Profile';
import Cloud from './CloudPage';
import { BASE_URL } from '../../config';
import ConfigPage from './ConfigPage';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/auth/checkSession`, {
      method: "GET",
      credentials: "include",
    })
    .then((res) => res.json())
    .then((data) => {
      if(data.loggedIn){
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        navigate("/login");
      }
    })
    .catch(() => {
      setIsLoggedIn(false);
      navigate("/login");
    })
    .finally(() => setLoading(false));
  }, [navigate]);

  if(loading){
    return <div className="flex justify-center items-center h-screen">Loading....</div>
  }

  if(!isLoggedIn){
    return <Navigate to="/login" replace/>;
  }

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
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;