const mongoose = require('mongoose');

/**
 * Inicia uma sessão do Mongoose com lógica de repetição (retry).
 * @param {number} retries - Número de tentativas de repetição.
 * @param {number} delay - Atraso (em milissegundos) entre as tentativas.
 * @returns {Promise<mongoose.ClientSession>} - Sessão do Mongoose.
 */
async function startSessionWithRetry(retries = 3, delay = 500) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const session = await mongoose.startSession();
      if (session) {
        return session;
      }
    } catch (error) {
      console.error(`Erro ao iniciar a sessão. Tentativa ${attempt + 1} de ${retries}`, error);
    }
    attempt++;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("Não foi possível iniciar a sessão após várias tentativas.");
}

// Exportar a função usando module.exports
module.exports = {
  startSessionWithRetry,
};
