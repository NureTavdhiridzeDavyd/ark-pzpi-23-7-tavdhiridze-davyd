const bcrypt = require('bcrypt');
const db = require('../db');

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing credentials' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        res.status(200).json({
            id: user.id,
            full_name: user.full_name,
            role: user.role
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    login
};