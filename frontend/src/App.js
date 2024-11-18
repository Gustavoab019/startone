import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './components/Auth/components/AuthPage'; // Fix the path
import Profile from './components/Dashboard/DashboardLayout';
import EvaluationForm from './components/Evaluations/EvaluationForm';




const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/evaluate/:id" element={<EvaluationForm />} />


      </Routes>
    </Router>
  );
};

export default App;
