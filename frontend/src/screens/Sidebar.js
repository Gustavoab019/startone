import React, { useState } from 'react';
import { FaCertificate, FaProjectDiagram, FaStar, FaComments, FaUser, FaSearch } from 'react-icons/fa';

const Sidebar = ({ setSection, handleLogout }) => {
  // Estado para controlar a abertura/fechamento da sidebar
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Função para fechar a sidebar ao clicar fora dela
  const handleClickOutside = (e) => {
    if (isSidebarOpen && e.target.className === 'sidebar-overlay') {
      setSidebarOpen(false);
    }
  };

  return (
    <div>
      {/* Botão de abrir/fechar a sidebar */}
      <button className="toggle-sidebar" onClick={() => setSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <nav>
          <ul>
            <li onClick={() => { setSection('profile'); setSidebarOpen(false); }}>
              <FaUser className="icon" />
              Profile
            </li>
            <li onClick={() => { setSection('certifications'); setSidebarOpen(false); }}>
              <FaCertificate className="icon" />
              Certifications
            </li>
            <li onClick={() => { setSection('portfolio'); setSidebarOpen(false); }}>
              <FaProjectDiagram className="icon" />
              Portfolio
            </li>
            <li onClick={() => { setSection('evaluations'); setSidebarOpen(false); }}>
              <FaComments className="icon" />
              Evaluations
            </li>
            <li onClick={() => { setSection('ratings'); setSidebarOpen(false); }}>
              <FaStar className="icon" />
              Ratings
            </li>
            <li onClick={() => { setSection('search'); setSidebarOpen(false); }}>
              <FaSearch className="icon" />
              Search
            </li>
          </ul>
        </nav>
        {/* Botão de Logout dentro da Sidebar */}
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </aside>

      {/* Overlay que cobre a tela quando a sidebar está aberta */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={handleClickOutside}></div>
      )}
    </div>
  );
};

export default Sidebar;
