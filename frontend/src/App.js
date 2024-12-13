import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './components/Auth/components/AuthPage'; // Fix the path
import Profile from './components/Dashboard/DashboardLayout';
import EvaluationForm from './components/Evaluations/EvaluationForm';
import PortfolioSection from './components/Portfolio/PortfolioSection';
import EvaluationsSection from './components/Evaluations/EvaluationsSection';
import DashboardVehicles from './components/Vehicles/DashboardVehicle';
import ManageEmployees from './components/Employees/ManageEmployees';
import NotificationsView from './components/Notifications/NotificationsView'




const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/evaluate/:id" element={<EvaluationForm />} />
        <Route path="/portfolio" element={<PortfolioSection />} />
        <Route path="/evaluations" element={<EvaluationsSection />} />
        <Route path="/vehicles" element={<DashboardVehicles />} />
        <Route path="/employees" element={<ManageEmployees />} />
        <Route path="/notifications" element={<NotificationsView />} />







      </Routes>
    </Router>
  );
};

export default App;
