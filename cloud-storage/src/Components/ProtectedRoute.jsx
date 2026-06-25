import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <Loading size="lg" text="Verifying session..." />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
