import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Auth/Login'; // Fix the path
import Signup from './components/Auth/Signup'; // Fix the path
import Dashboard from './components/Dashboard';
import Profile from './screens/ProfileContainer';
import Professionals from './screens/ProfessionalSearch';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profissionals" element={<Professionals />} />

      </Routes>
    </Router>
  );
};

export default App;
