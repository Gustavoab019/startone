import React, { useState } from 'react';
import axios from 'axios';
import styles from './styles.module.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {isLogin ? <LoginForm /> : <SignupForm />}
        <p>
          {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
          <span className={styles.toggle} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? " Registre-se" : " Entrar"}
          </span>
        </p>
      </div>
    </div>
  );
};

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/users/login', { email, password });
      localStorage.setItem('token', response.data.token);
      window.location.href = '/profile';
    } catch (error) {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Entrar</h2>
      <p className={styles.subtitle}>Bem-vindo de volta! Faça login para continuar.</p>
      <input
        type="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
      />
      
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.options}>
        <label className={styles.remember}>
          <input type="checkbox" /> Lembrar-me
        </label>
        <a href="/forgot-password">Esqueceu sua senha?</a>
      </div>

      <button type="submit" className={styles.button}>Entrar</button>

      <div className={styles.socialSection}>
        <div className={styles.divider}>Ou continue com</div>
        <div className={styles.socialButtons}>
          <button className={styles.socialButton}>Facebook</button>
          <button className={styles.socialButton}>Google</button>
        </div>
      </div>
    </form>
  );
};

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    type: 'professional',
    location: '',
    specialties: [],
    experienceYears: 0,
    companyDetails: {
      companyName: '',
      location: '',
      services: []
    }
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users/register', formData);
      window.location.href = '/login';
    } catch (error) {
      setError('Falha no registro. Tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Registre-se</h2>
      <input
        type="text"
        name="name"
        placeholder="Nome"
        value={formData.name}
        onChange={handleChange}
        className={styles.input}
      />
      <input
        type="email"
        name="email"
        placeholder="seu@email.com"
        value={formData.email}
        onChange={handleChange}
        className={styles.input}
      />
      <input
        type="password"
        name="password"
        placeholder="Senha"
        value={formData.password}
        onChange={handleChange}
        className={styles.input}
      />

      <select 
        name="type"
        value={formData.type}
        onChange={handleChange}
        className={styles.input}
      >
        <option value="professional">Profissional</option>
        <option value="company">Empresa</option>
        <option value="client">Cliente</option>
      </select>

      {formData.type === 'professional' && (
        <>
          <input
            type="text"
            name="location"
            placeholder="Localização"
            value={formData.location}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="number"
            name="experienceYears"
            placeholder="Anos de Experiência"
            value={formData.experienceYears}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="text"
            name="specialties"
            placeholder="Especialidades (separadas por vírgula)"
            value={formData.specialties.join(',')}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              specialties: e.target.value.split(',')
            }))}
            className={styles.input}
          />
        </>
      )}

      {formData.type === 'company' && (
        <>
          <input
            type="text"
            name="companyDetails.companyName"
            placeholder="Nome da Empresa"
            value={formData.companyDetails.companyName}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="text"
            name="companyDetails.location"
            placeholder="Localização da Empresa"
            value={formData.companyDetails.location}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="text"
            name="companyDetails.services"
            placeholder="Serviços (separados por vírgula)"
            value={formData.companyDetails.services.join(',')}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              companyDetails: {
                ...prev.companyDetails,
                services: e.target.value.split(',')
              }
            }))}
            className={styles.input}
          />
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={styles.button}>Registrar</button>
    </form>
  );
};

export default AuthPage;