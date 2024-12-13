import React, { useState } from 'react';
import { FaCertificate, FaProjectDiagram, FaStar, FaComments, FaUser, FaSearch, FaTachometerAlt, FaUsers, FaCar, FaBell } from 'react-icons/fa';
import styles from './styles.module.css'; // Importa o CSS Module

const Sidebar = ({ setSection, handleLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleClickOutside = (e) => {
    if (isSidebarOpen && e.target.className === styles.overlay) { // Usando o nome da classe do CSS Module
      setSidebarOpen(false);
    }
  };

  const handleSectionClick = (section) => {
    setSection(section);
    setActiveSection(section);
    setSidebarOpen(false);
  };

  return (
    <div>
      <button className={styles.toggleButton} onClick={() => {
            setSidebarOpen(!isSidebarOpen);
            console.log(isSidebarOpen); // Verifique o estado aqui
          }}>
            {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
        </button>

      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
        <nav>
          <ul className={styles.menuList}>
            <li
              className={`${styles.menuItem} ${activeSection === 'dashboard' ? styles.active : ''}`}
              onClick={() => handleSectionClick('dashboard')}
            >
              <FaTachometerAlt className={styles.icon} />
              Dashboard
            </li>
            <li
              className={`${styles.menuItem} ${activeSection === 'profile' ? styles.active : ''}`}
              onClick={() => handleSectionClick('profile')}
            >
              <FaUser className={styles.icon} />
              Profile
            </li>
            <li
              className={`${styles.menuItem} ${activeSection === 'certifications' ? styles.active : ''}`}
              onClick={() => handleSectionClick('certifications')}
            >
              <FaCertificate className={styles.icon} />
              Certifications
            </li>
            <li
              className={`${styles.menuItem} ${activeSection === 'portfolio' ? styles.active : ''}`}
              onClick={() => handleSectionClick('portfolio')}
            >
              <FaProjectDiagram className={styles.icon} />
              Portfolio
            </li>
            <li
              className={`${styles.menuItem} ${activeSection === 'evaluations' ? styles.active : ''}`}
              onClick={() => handleSectionClick('evaluations')}
            >
              <FaComments className={styles.icon} />
              Evaluations
            </li>
            <li
              className={`${styles.menuItem} ${activeSection === 'ratings' ? styles.active : ''}`}
              onClick={() => handleSectionClick('ratings')}
            >
              <FaStar className={styles.icon} />
              Ratings
            </li>
            <li
              className={`${styles.menuItem} ${activeSection === 'search' ? styles.active : ''}`}
              onClick={() => handleSectionClick('search')}
            >
              <FaSearch className={styles.icon} />
              Search
            </li>
            <li
              className={`${styles.menuItem} ${activeSection === 'employees' ? styles.active : ''}`}
              onClick={() => handleSectionClick('employees')}
            >
              <FaUsers className={styles.icon} />
              Employees
            </li><li
              className={`${styles.menuItem} ${activeSection === 'vehicles' ? styles.active : ''}`}
              onClick={() => handleSectionClick('vehicles')}
            >
              <FaCar className={styles.icon} />
              Vehicles
            </li>
            <li
              className={`${styles.menuItem} ${activeSection === 'notifications' ? styles.active : ''}`}
              onClick={() => handleSectionClick('notifications')}
            >
              <FaBell className={styles.icon} />
              Notifications
            </li>
          </ul>
        </nav>
        <div className={styles.logoutContainer}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div className={styles.overlay} onClick={handleClickOutside}></div>
      )}
    </div>
  );
};

export default Sidebar;
