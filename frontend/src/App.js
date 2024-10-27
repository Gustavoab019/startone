import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './components/Auth/AuthPage'; // Fix the path
import Dashboard from './components/Dashboard';
import Profile from './screens/ProfileContainer';
import Professionals from './screens/ProfessionalSearch';
import EvaluationForm from './screens/EvaluationForm';



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profissionals" element={<Professionals />} />
        <Route path="/evaluate/:id" element={<EvaluationForm />} />

      </Routes>
    </Router>
  );
};

export default App;
