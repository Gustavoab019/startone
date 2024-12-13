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
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/users/login', formData);
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
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        className={styles.input}
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        className={styles.input}
        required
      />
      
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.options}>
        <label className={styles.remember}>
          <input type="checkbox" /> Lembrar-me
        </label>
        <a href="/forgot-password">Esqueceu sua senha?</a>
      </div>

      <button type="submit" className={styles.button}>Entrar</button>
    </form>
  );
};

const SignupForm = () => {
  const initialFormData = {
    name: '',
    email: '',
    password: '',
    type: 'professional',
    location: '',
    specialties: [],
    experienceYears: '',
    companyDetails: {
      companyName: '',
      location: '',
      services: []
    }
  };

  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!formData.name) newErrors.name = 'Nome é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    if (!formData.location) newErrors.location = 'Localização é obrigatória';

    // Type-specific validations
    if (formData.type === 'professional') {
      if (!formData.specialties.length) newErrors.specialties = 'Pelo menos uma especialidade é obrigatória';
      if (!formData.experienceYears) newErrors.experienceYears = 'Anos de experiência é obrigatório';
    }

    if (formData.type === 'company') {
      if (!formData.companyDetails.companyName) {
        newErrors.companyName = 'Nome da empresa é obrigatório';
      }
      if (!formData.companyDetails.services.length) {
        newErrors.services = 'Pelo menos um serviço é obrigatório';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    if (!validateForm()) return;

    try {
      await axios.post('/api/users/register', formData);
      window.location.href = '/';
    } catch (error) {
      setError('Falha no registro. Tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Registre-se</h2>
      
      {/* Common fields for all user types */}
      <input
        type="text"
        name="name"
        placeholder="Nome completo"
        value={formData.name}
        onChange={handleChange}
        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
        required
      />
      {errors.name && <p className={styles.error}>{errors.name}</p>}

      <input
        type="email"
        name="email"
        placeholder="seu@email.com"
        value={formData.email}
        onChange={handleChange}
        className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
        required
      />
      {errors.email && <p className={styles.error}>{errors.email}</p>}

      <input
        type="password"
        name="password"
        placeholder="Senha (mínimo 6 caracteres)"
        value={formData.password}
        onChange={handleChange}
        className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
        required
      />
      {errors.password && <p className={styles.error}>{errors.password}</p>}

      <select 
        name="type"
        value={formData.type}
        onChange={handleChange}
        className={styles.input}
        required
      >
        <option value="professional">Profissional</option>
        <option value="company">Empresa</option>
        <option value="client">Cliente</option>
      </select>

      <input
        type="text"
        name="location"
        placeholder="Localização"
        value={formData.location}
        onChange={handleChange}
        className={`${styles.input} ${errors.location ? styles.inputError : ''}`}
        required
      />
      {errors.location && <p className={styles.error}>{errors.location}</p>}

      {/* Professional-specific fields */}
      {formData.type === 'professional' && (
        <>
          <input
            type="number"
            name="experienceYears"
            placeholder="Anos de Experiência"
            value={formData.experienceYears}
            onChange={handleChange}
            className={`${styles.input} ${errors.experienceYears ? styles.inputError : ''}`}
            required
            min="0"
          />
          {errors.experienceYears && <p className={styles.error}>{errors.experienceYears}</p>}

          <input
            type="text"
            name="specialties"
            placeholder="Especialidades (separadas por vírgula)"
            value={formData.specialties.join(',')}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s)
            }))}
            className={`${styles.input} ${errors.specialties ? styles.inputError : ''}`}
            required
          />
          {errors.specialties && <p className={styles.error}>{errors.specialties}</p>}
        </>
      )}

      {/* Company-specific fields */}
      {formData.type === 'company' && (
        <>
          <input
            type="text"
            name="companyDetails.companyName"
            placeholder="Nome da Empresa"
            value={formData.companyDetails.companyName}
            onChange={handleChange}
            className={`${styles.input} ${errors.companyName ? styles.inputError : ''}`}
            required
          />
          {errors.companyName && <p className={styles.error}>{errors.companyName}</p>}

          <input
            type="text"
            name="companyDetails.services"
            placeholder="Serviços (separados por vírgula)"
            value={formData.companyDetails.services.join(',')}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              companyDetails: {
                ...prev.companyDetails,
                services: e.target.value.split(',').map(s => s.trim()).filter(s => s)
              }
            }))}
            className={`${styles.input} ${errors.services ? styles.inputError : ''}`}
            required
          />
          {errors.services && <p className={styles.error}>{errors.services}</p>}
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={styles.button}>Registrar</button>
    </form>
  );
};

export default AuthPage;