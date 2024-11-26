import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './components/Auth/components/AuthPage'; // Fix the path
import Profile from './components/Dashboard/DashboardLayout';
import EvaluationForm from './components/Evaluations/EvaluationForm';
import PortfolioSection from './components/Portfolio/PortfolioSection';
import EvaluationsSection from './components/Evaluations/EvaluationsSection';




const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/evaluate/:id" element={<EvaluationForm />} />
        <Route path="/portfolio" element={<PortfolioSection />} />
        <Route path="/evaluations" element={<EvaluationsSection />} />



      </Routes>
    </Router>
  );
};

export default App;
