import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './Auth/login';
import Register from './Auth/register';
import HeroPage from './Components/HomePage';
// import DashBoard from './Components/DashBoard';
import Cloud from './Components/CloudPage';
import Dashboard from './Components/Dashboard';
import ForgetPassword from './Auth/forgetPassword';
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path='/forgetPassword' element={<ForgetPassword/>}/>
          <Route path="/*" element={<HeroPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path='/dashboardHome' element={<Navigate to="/dashboard/home" replace />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;