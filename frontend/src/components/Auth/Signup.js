import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userData = {
      name,
      email,
      password,
      type,
      location: type === 'professional' ? location : null,
      specialties: type === 'professional' ? specialties : [],
      experienceYears: type === 'professional' ? experienceYears : null,
      companyDetails: type === 'company' ? companyDetails : null,
    };

    try {
      await axios.post('/api/users/register', userData);
      alert('User registered successfully');
      // Optionally redirect or show success message
    } catch (error) {
      setError('Registration failed');
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        {/* User Type Selection */}
        <select value={type} onChange={(e) => setType(e.target.value)}>
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
            />
            <input
              type="number"
              placeholder="Years of Experience"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
            />
            <input
              type="text"
              placeholder="Specialties (comma separated)"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value.split(','))}
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
            />
            <input
              type="text"
              placeholder="Company Location"
              value={companyDetails.location}
              onChange={(e) => setCompanyDetails({ ...companyDetails, location: e.target.value })}
            />
            <input
              type="text"
              placeholder="Services (comma separated)"
              value={companyDetails.services}
              onChange={(e) => setCompanyDetails({ ...companyDetails, services: e.target.value.split(',') })}
            />
          </>
        )}

        {error && <p>{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
