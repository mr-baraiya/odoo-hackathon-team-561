const Database = require('@/service/database');

/**
 * Middleware to handle database connection and release automatically
 * @param {function} controller - The controller function to wrap
 * @returns {function} - The wrapped controller function
 */
function withDatabase(controller) {
  return async (req, res, next) => {
    const db = await Database.getConnection();
    try {
      await controller(req, res, next, db);
    } catch (error) {
      next(error);
    } finally {
      db.release();
    }
  };
}

module.exports = withDatabase;
