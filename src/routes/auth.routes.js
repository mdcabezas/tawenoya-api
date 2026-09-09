const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google/failure' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({ token, user: { id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role } });
  }
);

router.get('/google/failure', (req, res) => {
  res.status(401).json({ error: 'Google authentication failed' });
});

router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    avatar_url: req.user.avatar_url,
    role: req.user.role,
    created_at: req.user.created_at,
  });
});

module.exports = router;
