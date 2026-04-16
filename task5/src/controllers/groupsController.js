const db = require('../db');

// Отримати всі групи
exports.getAllGroups = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         id,
         name,
         category,
         start_date AS startDate,
         end_date   AS endDate
       FROM groups
       ORDER BY start_date`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error getAllGroups:', err);
    res.status(500).json({ message: 'Помилка сервера при отриманні груп' });
  }
};

// Створити нову групу
exports.createGroup = async (req, res) => {
  try {
    const { name, category, startDate, endDate } = req.body;

    if (!name || !category || !startDate || !endDate) {
      return res.status(400).json({
        message: 'Необхідні поля: name, category, startDate, endDate'
      });
    }

    const [result] = await db.query(
      `INSERT INTO groups (name, category, start_date, end_date)
       VALUES (?, ?, ?, ?)`,
      [name, category, startDate, endDate]
    );

    const newId = result.insertId;

    const [rows] = await db.query(
      `SELECT 
         id,
         name,
         category,
         start_date AS startDate,
         end_date   AS endDate
       FROM groups
       WHERE id = ?`,
      [newId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error createGroup:', err);
    res.status(500).json({ message: 'Помилка сервера при створенні групи' });
  }
};
