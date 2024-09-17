import React from 'react';
import { FaCertificate, FaProjectDiagram, FaStar, FaComments, FaUser } from 'react-icons/fa';

const Sidebar = ({ setSection }) => (
  <aside className="sidebar">
    <nav>
      <ul>
        <li onClick={() => setSection('profile')}>
          <FaUser className="icon" />
          Profile
        </li>
        <li onClick={() => setSection('certifications')}>
          <FaCertificate className="icon" />
          Certifications
        </li>
        <li onClick={() => setSection('portfolio')}>
          <FaProjectDiagram className="icon" />
          Portfolio
        </li>
        <li onClick={() => setSection('testimonials')}>
          <FaComments className="icon" />
          Testimonials
        </li>
        <li onClick={() => setSection('ratings')}>
          <FaStar className="icon" />
          Ratings
        </li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar;
