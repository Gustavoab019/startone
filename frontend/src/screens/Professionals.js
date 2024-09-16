    import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Professionals = () => {
  const [professionals, setProfessionals] = useState([]);
  const [filters, setFilters] = useState({
    specialty: '',
    location: '',
    averageRatingMin: 0,
    averageRatingMax: 5,
  });

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const { data } = await axios.get('/api/users/professionals', { params: filters });
        setProfessionals(data);
      } catch (error) {
        console.error('Error fetching professionals', error);
      }
    };

    fetchProfessionals();
  }, [filters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div className="professionals-container">
      <h2>Find Professionals</h2>
      <div className="filters">
        <input
          type="text"
          name="specialty"
          placeholder="Specialty"
          value={filters.specialty}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={filters.location}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="averageRatingMin"
          placeholder="Min Rating"
          value={filters.averageRatingMin}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="averageRatingMax"
          placeholder="Max Rating"
          value={filters.averageRatingMax}
          onChange={handleInputChange}
        />
      </div>
      <div className="professionals-list">
        {professionals.map((pro) => (
          <div key={pro._id} className="professional-card">
            <h3>{pro.name}</h3>
            <p>Specialties: {pro.specialties.join(', ')}</p>
            <p>Location: {pro.location}</p>
            <p>Average Rating: {pro.averageRating}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Professionals;
