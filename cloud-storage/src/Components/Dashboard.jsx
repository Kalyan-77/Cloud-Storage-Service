import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate  } from 'react-router-dom';
import CloudStorageNavbar from '../Pages/Dashboard/Navbar'; 
import Home from '../Pages/Dashboard/Home';
import Configure from '../Pages/Dashboard/Configure';
import Profile from '../Pages/Dashboard/Profile';
// import Cloud from '../Pages/Cloud';
import Cloud from './CloudPage';

const Dashboard = () => {
  const [loading,setLoading] = useState(true);
  const [isLoggedIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/auth/checkSession",{
      method: "GET",
      credentials: "include",
    })
    .then((res) => res.json())
    .then((data) => {
      if(data.loggedIn){
        setIsLoggingIn(true);
      }else{
        setIsLoggingIn(false);
        navigate("/login");
      }
    })
    .catch(() =>{
      setIsLoggingIn(false);
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
      <CloudStorageNavbar /> Sidebar
      
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/configure" element={<Configure />} />
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/cloud' element={<Cloud/>}/>

          <Route path="/cloud/*" element={<Cloud />} />
          
          {/* Redirect any unknown dashboard routes to home */}
          {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;