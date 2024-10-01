import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/Auth.css'; // Import your styles

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup

  const toggleForm = () => {
    setIsLogin(!isLogin); // Toggle between login and signup forms
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src="/assets/img_login.png" alt="Business success" className="auth-image" />
        <div className="auth-tagline">
          <h1>Multipurpose Tool<br />to Succeed Your Business</h1>
        </div>
      </div>
      <div className="auth-right">
        {isLogin ? <LoginForm /> : <SignupForm />}
        <p>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span className="auth-toggle" onClick={toggleForm}>
            {isLogin ? " Sign Up" : " Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
};

// LoginForm Component
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/users/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setMessage('Login successful! Redirecting...');
      setError('');
      window.location.href = '/profile';
    } catch (error) {
      setError('Invalid credentials. Please try again.');
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Sign In</h2>
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="auth-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="auth-input"
      />
      
      {/* Display error or success message */}
      {error && <p className="auth-error">{error}</p>}
      {message && <p className="auth-success">{message}</p>}

      <button type="submit" className="auth-button">Sign In</button>
      <div className="auth-footer">
        <a href="/forgot-password" className="auth-link">Forgot password?</a>
      </div>
    </form>
  );
};

// SignupForm Component
const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('professional');  // professional, company, client
  const [location, setLocation] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [experienceYears, setExperienceYears] = useState(0);
  const [companyDetails, setCompanyDetails] = useState({
    companyName: '',
    location: '',
    services: []
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      name,
      email,
      password,
      type,
      location: type === 'professional' ? location : companyDetails.location,
      specialties: type === 'professional' ? specialties : [],
      experienceYears: type === 'professional' ? experienceYears : null,
      companyDetails: type === 'company' ? {
        companyName: companyDetails.companyName,
        location: companyDetails.location,
        services: companyDetails.services
      } : null
    };

    try {
      await axios.post('/api/users/register', userData);
      setMessage('User registered successfully!');
      setError('');
    } catch (error) {
      setError('Registration failed. Please try again.');
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Sign Up</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="auth-input"
      />
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="auth-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="auth-input"
      />

      {/* User Type Selection */}
      <select value={type} onChange={(e) => setType(e.target.value)} className="auth-input">
        <option value="professional">Professional</option>
        <option value="company">Company</option>
        <option value="client">Client</option>
      </select>

      {/* Conditional Fields for Professional */}
      {type === 'professional' && (
        <>
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="auth-input"
          />
          <input
            type="number"
            placeholder="Years of Experience"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            className="auth-input"
          />
          <input
            type="text"
            placeholder="Specialties (comma separated)"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value.split(','))}
            className="auth-input"
          />
        </>
      )}

      {/* Conditional Fields for Company */}
      {type === 'company' && (
        <>
          <input
            type="text"
            placeholder="Company Name"
            value={companyDetails.companyName}
            onChange={(e) => setCompanyDetails({ ...companyDetails, companyName: e.target.value })}
            className="auth-input"
          />
          <input
            type="text"
            placeholder="Company Location"
            value={companyDetails.location}
            onChange={(e) => setCompanyDetails({ ...companyDetails, location: e.target.value })}
            className="auth-input"
          />
          <input
            type="text"
            placeholder="Services (comma separated)"
            value={companyDetails.services}
            onChange={(e) => setCompanyDetails({ ...companyDetails, services: e.target.value.split(',') })}
            className="auth-input"
          />
        </>
      )}

      {/* Display error or success message */}
      {error && <p className="auth-error">{error}</p>}
      {message && <p className="auth-success">{message}</p>}

      <button type="submit" className="auth-button">Sign Up</button>
    </form>
  );
};

export default AuthPage;
