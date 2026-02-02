const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;
const SECRET_KEY = process.env.SECRET_KEY || 'supersecret';

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'auth-node' });
});

app.post('/v1/login', (req, res) => {
    // Mock login
    const { username } = req.body;
    const token = jwt.sign({ username, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});
