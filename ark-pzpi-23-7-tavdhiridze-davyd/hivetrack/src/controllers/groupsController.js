const pool = require('../db');

async function getAllGroups(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM `groups` ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('getAllGroups error:', err);
    res.status(500).json({ message: 'Помилка сервера при отриманні груп' });
  }
}

async function createGroup(req, res, next) {
  try {
    const { name, category, startDate, endDate } = req.body;

    if (!name || !category || !startDate || !endDate) {
      return res.status(400).json({ message: 'Потрібні поля: name, category, startDate, endDate' });
    }

    const sql =
      'INSERT INTO `groups` (`name`, `category`, `start_date`, `end_date`) VALUES (?, ?, ?, ?)';
    const params = [name, category, startDate, endDate];

    const [result] = await pool.query(sql, params);

    res.status(201).json({
      id: result.insertId,
      name,
      category,
      startDate,
      endDate
    });
  } catch (err) {
    console.error('createGroup error:', err);
    res.status(500).json({ message: 'Помилка сервера при створенні групи' });
  }
}

module.exports = {
  getAllGroups,
  createGroup
};
