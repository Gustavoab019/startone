import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useProfileData = () => {
  const [profile, setProfile] = useState(null);

  const fetchProfileData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erro ao carregar os dados do perfil');

      const data = await response.json();
      setProfile({
        ...data,
        followers: data.followers || [],
        following: data.following || [],
        specialties: data.specialties || [],
        certifications: data.certifications || [],
        portfolio: data.portfolio || [],
        companyLink: data.companyLink || {},
      });
    } catch (error) {
      console.error('Erro ao buscar os dados do perfil:', error);
      toast.error('Erro ao carregar os dados do perfil.');
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return { profile, fetchProfileData };
};
