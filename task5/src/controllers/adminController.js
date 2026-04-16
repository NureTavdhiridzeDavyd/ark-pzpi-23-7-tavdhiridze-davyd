const db = require('../db');
const { BusinessError } = require('../errors/BusinessError');

exports.blockUser = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      throw new BusinessError('Некоректний id користувача', 400);
    }

    const currentAdminId = req.user.id;

    if (Number(currentAdminId) === Number(targetUserId)) {
      throw new BusinessError('Адміністратор не може заблокувати сам себе', 400);
    }

    const [userRows] = await db.query(
      'SELECT id, role, is_active AS isActive FROM users WHERE id = ?',
      [targetUserId]
    );
    const user = userRows[0];

    if (!user) {
      throw new BusinessError('Користувача не знайдено', 404);
    }

    if (user.role === 'Admin') {
      const [countRows] = await db.query(
        'SELECT COUNT(*) AS cnt FROM users WHERE role = "Admin" AND is_active = 1'
      );
      if (countRows[0].cnt <= 1) {
        throw new BusinessError('Неможливо заблокувати останнього активного адміністратора', 400);
      }
    }

    if (user.isActive === 0) {
      return res.json({ message: 'Користувач уже заблокований (is_active = 0)' });
    }

    await db.query('UPDATE users SET is_active = 0 WHERE id = ?', [targetUserId]);

    res.json({ message: 'Користувача успішно заблоковано (is_active = 0)' });
  } catch (err) {
    console.error('Error blockUser:', err);
    next(err);
  }
};

exports.getUserStatistics = async (req, res, next) => {
  try {
    const PASS_SCORE = 60;

    const [
      [totalUsersRows],
      [blockedUsersRows],
      [studentsRows],
      [instructorsRows],
      [adminsRows],
      [groupsRows],
      [totalAttemptsRows],
      [passedAttemptsRows]
    ] = await Promise.all([
      db.query('SELECT COUNT(*) AS cnt FROM users'),
      db.query('SELECT COUNT(*) AS cnt FROM users WHERE is_active = 0'),
      db.query(`SELECT COUNT(*) AS cnt FROM users WHERE role = 'Student'`),
      db.query(`SELECT COUNT(*) AS cnt FROM users WHERE role = 'Instructor'`),
      db.query(`SELECT COUNT(*) AS cnt FROM users WHERE role = 'Admin'`),
      db.query('SELECT COUNT(*) AS cnt FROM groups'),
      db.query('SELECT COUNT(*) AS cnt FROM test_attempts'),
      db.query('SELECT COUNT(*) AS cnt FROM test_attempts WHERE score >= ?', [PASS_SCORE])
    ]);

    res.json({
      totalUsers: totalUsersRows[0].cnt,
      blockedUsers: blockedUsersRows[0].cnt,
      studentsCount: studentsRows[0].cnt,
      instructorsCount: instructorsRows[0].cnt,
      adminsCount: adminsRows[0].cnt,
      totalGroups: groupsRows[0].cnt,
      totalTestAttempts: totalAttemptsRows[0].cnt,
      passedAttempts: passedAttemptsRows[0].cnt,
      passRule: `score >= ${PASS_SCORE}`
    });
  } catch (err) {
    console.error('Error getUserStatistics:', err);
    next(err);
  }
};
