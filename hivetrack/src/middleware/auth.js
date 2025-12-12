const db = require('../db');
const { BusinessError } = require('../errors/BusinessError');

async function auth(req, res, next) {
  try {
    const rawUserId = req.header('X-User-Id');
    if (!rawUserId) throw new BusinessError('Missing X-User-Id header', 401);

    const userId = Number(rawUserId);
    if (!Number.isFinite(userId) || userId <= 0) throw new BusinessError('Invalid X-User-Id header', 401);

    const [rows] = await db.query(
      `SELECT 
         id,
         full_name AS fullName,
         role,
         is_active AS isActive
       FROM users
       WHERE id = ?`,
      [userId]
    );

    const user = rows[0];
    if (!user) throw new BusinessError('User not found', 401);

    if (user.isActive === 0) throw new BusinessError('User is blocked', 403);

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new BusinessError('Not authenticated', 401));
    if (!roles.includes(req.user.role)) return next(new BusinessError('Access denied', 403));
    next();
  };
}

module.exports = { auth, requireRole };
