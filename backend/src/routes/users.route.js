const express = require('express');
const bcrypt = require('bcryptjs');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/users
router.get('/', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  res.json(seed.USERS);
});

// GET /api/users/:id
router.get('/:id', authenticateJWT, (req, res) => {
  const user = seed.USERS.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// POST /api/users
router.post('/', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const { full_name, email, phone_number, role, password } = req.body;
  const newId = `user_${Date.now()}`;
  const newUser = {
    id: newId,
    full_name: full_name || 'New User',
    email,
    phone_number: phone_number || '',
    role: role || 'sales_rep',
    password_hash: bcrypt.hashSync(password || 'Darshan@1234', 10),
    is_active: true,
    created_at: new Date().toISOString(),
  };

  seed.USERS.push(newUser);
  res.status(201).json(newUser);
});

// PUT /api/users/:id
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'sales_manager'), (req, res) => {
  const user = seed.USERS.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { full_name, email, phone_number, role, is_active } = req.body;
  if (full_name !== undefined) user.full_name = full_name;
  if (email !== undefined) user.email = email;
  if (phone_number !== undefined) user.phone_number = phone_number;
  if (role !== undefined) user.role = role;
  if (is_active !== undefined) user.is_active = is_active;

  res.json(user);
});

// PATCH /api/users/:id
router.patch('/:id', authenticateJWT, authorizeRoles('admin', 'sales_manager'), (req, res) => {
  const user = seed.USERS.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  Object.assign(user, req.body);
  res.json(user);
});

// PATCH /api/users/:id/status
router.patch('/:id/status', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const user = seed.USERS.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.is_active = req.body.is_active !== undefined ? req.body.is_active : !user.is_active;
  res.json({ message: `User status updated to ${user.is_active ? 'active' : 'inactive'}`, user });
});

// DELETE /api/users/:id
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const index = seed.USERS.findIndex((u) => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'User not found' });

  const deleted = seed.USERS.splice(index, 1)[0];
  res.json({ message: 'User deleted successfully', user: deleted });
});

module.exports = router;
