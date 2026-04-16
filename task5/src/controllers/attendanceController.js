const db = require('../db');

// Створити запис відвідуваності
exports.createAttendance = async (req, res) => {
  try {
    const { lessonId, studentId, status, comment } = req.body;

    if (!lessonId || !studentId || !status) {
      return res.status(400).json({
        message: 'Необхідні поля: lessonId, studentId, status'
      });
    }

    const [result] = await db.query(
      `INSERT INTO attendance (lesson_id, student_id, status, comment)
       VALUES (?, ?, ?, ?)`,
      [lessonId, studentId, status, comment || null]
    );

    const newId = result.insertId;

    const [rows] = await db.query(
      `SELECT 
         id,
         lesson_id  AS lessonId,
         student_id AS studentId,
         status,
         comment
       FROM attendance
       WHERE id = ?`,
      [newId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error createAttendance:', err);
    res.status(500).json({ message: 'Помилка сервера при створенні запису відвідуваності' });
  }
};

// Отримати відвідуваність для конкретного заняття
exports.getAttendanceByLesson = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;

    const [rows] = await db.query(
      `SELECT 
         a.id,
         a.lesson_id  AS lessonId,
         a.student_id AS studentId,
         u.full_name  AS studentName,
         a.status,
         a.comment
       FROM attendance a
       JOIN users u ON a.student_id = u.id
       WHERE a.lesson_id = ?
       ORDER BY u.full_name`,
      [lessonId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error getAttendanceByLesson:', err);
    res.status(500).json({ message: 'Помилка сервера при отриманні відвідуваності' });
  }
};

// Отримати історію відвідуваності одного студента
exports.getAttendanceByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const [rows] = await db.query(
      `SELECT 
         a.id,
         a.lesson_id  AS lessonId,
         l.topic      AS lessonTopic,
         l.lesson_datetime AS lessonDateTime,
         a.status,
         a.comment
       FROM attendance a
       JOIN lessons l ON a.lesson_id = l.id
       WHERE a.student_id = ?
       ORDER BY l.lesson_datetime`,
      [studentId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error getAttendanceByStudent:', err);
    res.status(500).json({ message: 'Помилка сервера при отриманні відвідуваності студента' });
  }
};
