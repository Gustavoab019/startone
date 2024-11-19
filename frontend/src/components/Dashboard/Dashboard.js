import React, { useState, useEffect, Suspense } from 'react';
import styles from './styles.module.css';

const MetricsCard = React.memo(({ metric }) => (
  <div className={styles.metricCard}>
    <h3 className={styles.metricTitle}>{metric.title}</h3>
    <div className={styles.metricValue}>{metric.value}</div>
    <div className={styles.metricChange}>{metric.change}</div>
  </div>
));

const Header = React.memo(({ profile }) => (
  <header className={styles.header}>
    <div>Logo</div>
    <div className={styles.userMenu}>
      <span>🔔</span>
      <span>{profile?.type}</span>
      <span>@{profile?.username}</span>
      <span>{profile?.name?.charAt(0).toUpperCase()}</span>
    </div>
  </header>
));

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal
        });

        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    return () => controller.abort();
  }, []);

  const metrics = [
    { title: 'Projetos Ativos', value: '12', change: '+2' },
    { title: 'Média de Avaliação', value: profile?.averageRating?.toFixed(1) || '0', change: '0' },
    { title: 'Visualizações', value: new Intl.NumberFormat('pt-BR').format(1234), change: '+21%' },
    { title: 'Seguidores', value: profile?.followersCount?.toLocaleString('pt-BR') || '0', change: '0' }
  ];

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className={styles.container}>
      <Suspense fallback={<div>Loading header...</div>}>
        <Header profile={profile} />
      </Suspense>

      <main className={styles.content}>
        <h1>Bem-vindo, {profile?.name}!</h1>
        
        <div className={styles.metricsGrid}>
          {metrics.map((metric, index) => (
            <Suspense key={index} fallback={<div>Loading metric...</div>}>
              <MetricsCard metric={metric} />
            </Suspense>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;