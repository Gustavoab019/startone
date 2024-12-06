const generateUsername = (name) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // Gera um sufixo numérico aleatório
    const baseUsername = name.toLowerCase().replace(/\s+/g, ''); // Remove espaços e converte para minúsculas
    return `${baseUsername}${randomSuffix}`; // Combina o nome base com o sufixo
  };
  
  module.exports = generateUsername; // Exporta a função
  