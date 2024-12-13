import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useProjects = () => {
  const [recentProjects, setRecentProjects] = useState([]);
  const [projectsCount, setProjectsCount] = useState(0);

  const fetchProjects = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/projects/my-projects', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erro ao carregar os projetos.');

      const data = await response.json();
      const sortedProjects = data.sort(
        (a, b) =>
          new Date(b.createdAt || b.completionDate) - new Date(a.createdAt || a.completionDate)
      );

      setRecentProjects(sortedProjects.slice(0, 3));
      setProjectsCount(data.length);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast.error('Erro ao carregar os projetos.');
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { recentProjects, projectsCount, fetchProjects };
};
