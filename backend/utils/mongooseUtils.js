const mongoose = require('mongoose');

async function withTransaction(callback) {
  let session = null;
  try {
    session = await mongoose.startSession();
    await session.startTransaction();
    
    const result = await callback(session);
    
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

module.exports = { withTransaction };