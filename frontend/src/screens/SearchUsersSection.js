import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa'; // Ícone de busca
import '../styles/SearchUser.css';

const SearchUsersSection = () => {
  const [searchQuery, setSearchQuery] = useState(''); // Query de busca
  const [searchResults, setSearchResults] = useState([]); // Resultados da busca
  const [isLoading, setIsLoading] = useState(false); // Estado de loading
  const [errorMessage, setErrorMessage] = useState(null); // Mensagens de erro

  // Função para lidar com mudanças no input de pesquisa
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    console.log('Query de busca:', event.target.value); // Log do valor de busca
  };

  // Função para buscar usuários na API conforme o usuário digita
  const searchUsers = useCallback(async () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]); // Limpa os resultados se não houver query
      return;
    }

    setIsLoading(true); // Inicia o loading
    setErrorMessage(null); // Limpa as mensagens de erro

    try {
      const token = localStorage.getItem('token'); // Obtém o token JWT
      if (!token) {
        setErrorMessage('User is not authenticated. Please log in.');
        setIsLoading(false);
        return;
      }

      console.log('Enviando request para /api/users/professionals com username:', searchQuery);

      const response = await fetch(`/api/users/professionals?username=${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log('Dados retornados pela API:', result); // Log dos dados retornados pela API

      if (response.ok) {
        if (result.length > 0) {
          setSearchResults(result); // Define os resultados da busca se houverem usuários
          console.log('Resultados da busca:', result);
        } else {
          setErrorMessage(`No users found matching "${searchQuery}".`);
          console.log('Nenhum usuário encontrado');
        }
      } else {
        setErrorMessage(result.message || 'Failed to fetch users.');
        console.error('Erro na resposta da API:', result.message || 'Erro desconhecido');
      }
    } catch (error) {
      setErrorMessage('An error occurred while searching for users.');
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setIsLoading(false); // Finaliza o estado de loading
    }
  }, [searchQuery]); // Dependência de `searchQuery`

  // Chama a função de busca toda vez que o `searchQuery` muda
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchUsers(); // Faz a busca após um pequeno delay para evitar chamadas excessivas
    }, 500); // Aguarda 500ms para evitar buscas muito rápidas

    return () => clearTimeout(delayDebounceFn); // Limpa o timeout se o componente for desmontado ou o query mudar
  }, [searchQuery, searchUsers]);

  // Função para renderizar o perfil retornado
  const renderProfile = (profile) => {
    console.log('Renderizando perfil:', profile); // Log dos dados do perfil
    const profileName = profile.userId.name || profile.username || 'User'; // Verifica se existe `name` ou `username`

    return (
      <div key={profile._id} className="user-result">
        <h2>{profileName}'s Profile</h2> {/* Nome do usuário */}
        <p><strong>Email:</strong> {profile.userId.email || 'Not provided'}</p>
        <p><strong>Location:</strong> {profile.userId.location || 'Not provided'}</p>
        <p><strong>Especialidades:</strong> {profile.specialties || 'Not provided'}</p>
        <p><strong>Anos de Experiência:</strong> {profile.experienceYears || 'Not provided'}</p>
        



        {profile.type === 'professional' && (
          <>
            <p><strong>Specialties:</strong> {profile.specialties && profile.specialties.length > 0 
              ? profile.specialties.join(', ') 
              : 'Not provided'}
            </p>
            <p><strong>Years of Experience:</strong> {profile.experienceYears || 'Not provided'}</p>
            <p><strong>Average Rating:</strong> {profile.averageRating || 'Not rated yet'}</p>
          </>
        )}

        {profile.type === 'client' && (
          <>
            <p><strong>Hiring History:</strong> {profile.hiringHistory && profile.hiringHistory.length > 0 
              ? profile.hiringHistory.join(', ') 
              : 'No history available'}
            </p>
            <p><strong>Reviews Given:</strong> {profile.reviewsGiven && profile.reviewsGiven.length > 0 
              ? profile.reviewsGiven.join(', ') 
              : 'No reviews available'}
            </p>
          </>
        )}

        {profile.type === 'company' && (
          <>
            <p><strong>Services Offered:</strong> {profile.services && profile.services.length > 0 
              ? profile.services.join(', ') 
              : 'Not provided'}
            </p>
            <p><strong>Employees:</strong> {profile.employees && profile.employees.length > 0 
              ? profile.employees.join(', ') 
              : 'No employees listed'}
            </p>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="search-users-section">
      <h3>Search Users</h3>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by username"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
          aria-label="Search for users by username"
        />
        <FaSearch className="search-icon" />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : errorMessage ? (
        <p className="error-message">{errorMessage}</p>
      ) : (
        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map((profile) => renderProfile(profile)) // Mapeia e renderiza os perfis
          ) : (
            <p>No users found matching "{searchQuery}".</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchUsersSection;
