const mongoose = require('mongoose');

/**
 * Função para gerenciar transações com maior robustez e validações.
 * @param {Function} callback - Função assíncrona que contém a lógica de transação.
 * @returns {Promise<any>} - Retorna o resultado do callback ou lança um erro em caso de falha.
 */
async function withTransaction(callback) {
  let session = null;
  try {
    // Inicia uma nova sessão
    session = await mongoose.startSession();

    // Valida se já há uma transação ativa na sessão
    if (session.inTransaction()) {
      throw new Error('Sessão já está em uma transação ativa.');
    }

    console.log(`[withTransaction] Sessão iniciada: ${session.id}`);

    // Inicia a transação
    await session.startTransaction();
    console.log(`[withTransaction] Transação iniciada: ${session.id}`);

    // Executa o callback no contexto da transação
    const result = await callback(session);

    // Confirma a transação
    await session.commitTransaction();
    console.log(`[withTransaction] Transação confirmada: ${session.id}`);

    return result;
  } catch (error) {
    // Reverte a transação em caso de erro
    if (session?.inTransaction()) {
      console.error(`[withTransaction] Erro na transação, abortando: ${error.message}`);
      await session.abortTransaction();
    }
    throw error;
  } finally {
    // Encerra a sessão
    if (session) {
      console.log(`[withTransaction] Encerrando sessão: ${session.id}`);
      await session.endSession();
    }
  }
}

/**
 * Função para executar transações com retentativa automática em caso de falhas transitórias.
 * @param {Function} callback - Função assíncrona que contém a lógica de transação.
 * @param {number} retries - Número máximo de retentativas (padrão: 3).
 * @returns {Promise<any>} - Retorna o resultado do callback ou lança um erro em caso de falha.
 */
async function withRetryTransaction(callback, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[withRetryTransaction] Tentativa ${attempt} de ${retries}`);
      return await withTransaction(callback);
    } catch (error) {
      console.error(`[withRetryTransaction] Erro na tentativa ${attempt}: ${error.message}`);
      if (attempt === retries) {
        throw new Error(`[withRetryTransaction] Todas as tentativas falharam: ${error.message}`);
      }
      // Aguardar antes de tentar novamente (opcional, para evitar excesso de chamadas consecutivas)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

module.exports = { withTransaction, withRetryTransaction };
