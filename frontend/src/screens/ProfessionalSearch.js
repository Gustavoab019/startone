import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ProfessionalSearch.css'; // Optional for custom styling

const ProfessionalSearch = () => {
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [averageRatingMin, setAverageRatingMin] = useState('');
  const [averageRatingMax, setAverageRatingMax] = useState('');
  const [professionals, setProfessionals] = useState([]);
  const [error, setError] = useState('');

  // Function to fetch professionals based on filters
  const fetchProfessionals = async (e) => {
    e.preventDefault();

    // Building query parameters dynamically based on non-empty values
    const params = {};
    if (specialty) params.specialty = specialty;
    if (location) params.location = location;
    if (averageRatingMin) params.averageRatingMin = averageRatingMin;
    if (averageRatingMax) params.averageRatingMax = averageRatingMax;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('User is not authenticated. Please log in.');
        return;
      }

      const response = await axios.get('/api/users/professionals', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setProfessionals(response.data);
      setError(''); // Clear error if the request is successful
    } catch (error) {
      console.error('Error fetching professionals:', error);
      setError('Error fetching professionals. Please try again later.');
    }
  };

  return (
    <div className="professional-search-container">
      <h2>Search Professionals</h2>
      <form onSubmit={fetchProfessionals}>
        <div className="form-group">
          <label>Specialty</label>
          <input
            type="text"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="Enter specialty (e.g., carpenter, electrician)"
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (e.g., Rio de Janeiro)"
          />
        </div>
        <div className="form-group">
          <label>Minimum Rating</label>
          <input
            type="number"
            value={averageRatingMin}
            onChange={(e) => setAverageRatingMin(e.target.value)}
            placeholder="Minimum rating (1-10)"
            min="1"
            max="10"
          />
        </div>
        <div className="form-group">
          <label>Maximum Rating</label>
          <input
            type="number"
            value={averageRatingMax}
            onChange={(e) => setAverageRatingMax(e.target.value)}
            placeholder="Maximum rating (1-10)"
            min="1"
            max="10"
          />
        </div>
        <button type="submit">Search</button>
      </form>

      {/* Display Results */}
      <div className="results">
        {error && <p className="error">{error}</p>}
        {professionals.length > 0 ? (
          professionals.map((professional) => (
            <div key={professional._id} className="professional-card">
              <h3>{professional.name}</h3>
              <p>Specialties: {professional.specialties.join(', ')}</p>
              <p>Location: {professional.location}</p>
              <p>Average Rating: {professional.averageRating}</p>
            </div>
          ))
        ) : (
          <p>No professionals found</p>
        )}
      </div>
    </div>
  );
};

export default ProfessionalSearch;
