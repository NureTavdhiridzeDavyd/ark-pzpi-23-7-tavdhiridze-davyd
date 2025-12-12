const { BusinessError } = require('../errors/BusinessError');

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof BusinessError) {
    return res.status(err.statusCode || 400).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Внутрішня помилка сервера' });
}

module.exports = { errorHandler };
