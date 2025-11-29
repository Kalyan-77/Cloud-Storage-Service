import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Auth/login';
import Register from './Auth/register';
import HeroPage from './Components/HomePage';
// import DashBoard from './Components/DashBoard';
import Cloud from './Components/CloudPage';
import Dashboard from './Components/Dashboard';
import Apps from './Apps';
import ForgetPassword from './Auth/forgetPassword';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path='/forgetPassword' element={<ForgetPassword/>}/>

          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path='/dashboardHome' element={<Dashboard/>} />


          <Route path="/*" element={<HeroPage />} />
          <Route path="/lists" element={<Apps/>} />
          
        </Routes>
      </Router>
    </div>
  );
}

export default App;