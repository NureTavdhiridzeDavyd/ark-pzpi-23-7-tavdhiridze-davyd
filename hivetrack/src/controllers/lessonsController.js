const db = require('../db');
const { BusinessError } = require('../errors/BusinessError');

// Повертає список занять для вказаної групи
exports.getLessonsByGroup = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;

    const [rows] = await db.query(
      `SELECT 
         id,
         group_id      AS groupId,
         instructor_id AS instructorId,
         type,
         topic,
         lesson_datetime AS lessonDateTime
       FROM lessons
       WHERE group_id = ?
       ORDER BY lesson_datetime`,
      [groupId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error getLessonsByGroup:', err);
    next(err);
  }
};

// Створює нове заняття з базовими бізнес-перевірками
exports.createLesson = async (req, res, next) => {
  try {
    const { groupId, instructorId, type, topic, lessonDateTime } = req.body;

    if (!groupId || !instructorId || !type || !topic || !lessonDateTime) {
      throw new BusinessError(
        'Необхідні поля: groupId, instructorId, type, topic, lessonDateTime',
        400
      );
    }

    const [groupRows] = await db.query(
      'SELECT id FROM groups WHERE id = ?',
      [groupId]
    );
    if (groupRows.length === 0) {
      throw new BusinessError('Навчальну групу не знайдено', 404);
    }

    const [instructorRows] = await db.query(
      'SELECT id, role FROM users WHERE id = ?',
      [instructorId]
    );
    const instructor = instructorRows[0];
    if (!instructor) {
      throw new BusinessError('Інструктора не знайдено', 404);
    }
    if (instructor.role !== 'Instructor') {
      throw new BusinessError('Користувач не має ролі Instructor', 400);
    }

    const [conflictRows] = await db.query(
      `SELECT COUNT(*) AS cnt
       FROM lessons
       WHERE instructor_id = ?
         AND lesson_datetime = ?`,
      [instructorId, lessonDateTime]
    );

    if (conflictRows[0].cnt > 0) {
      throw new BusinessError(
        'В обраний час інструктор уже має заплановане заняття',
        400
      );
    }

    const [result] = await db.query(
      `INSERT INTO lessons (group_id, instructor_id, type, topic, lesson_datetime)
       VALUES (?, ?, ?, ?, ?)`,
      [groupId, instructorId, type, topic, lessonDateTime]
    );

    const newId = result.insertId;

    const [rows] = await db.query(
      `SELECT 
         id,
         group_id      AS groupId,
         instructor_id AS instructorId,
         type,
         topic,
         lesson_datetime AS lessonDateTime
       FROM lessons
       WHERE id = ?`,
      [newId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error createLesson:', err);
    next(err); 
  }
};
