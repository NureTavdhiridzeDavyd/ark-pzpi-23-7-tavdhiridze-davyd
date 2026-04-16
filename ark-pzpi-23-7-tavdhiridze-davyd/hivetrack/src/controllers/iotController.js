const express = require('express');
const router = express.Router();

router.get('/sessions', (req, res) => {
  res.json({ message: 'IoT endpoint працює. Використовуйте POST для надсилання звітів.' });
});

router.post('/sessions', async (req, res, next) => {
  try {
    const sessionReport = req.body;

    console.log('Отримано IoT-звіт від клієнта:');
    console.log(JSON.stringify(sessionReport, null, 2));

    res.status(201).json({ message: 'IoT session received' });
  } catch (err) {
    console.error('Error in /api/iot/sessions:', err);
    next(err);
  }
});

module.exports = router;
