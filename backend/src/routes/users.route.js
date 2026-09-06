const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const seed = require('../db/dealflow360_seed');
const { getConnection } = require('../service/database');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/users - Fetch all users from PostgreSQL DB (with fallback to seed)
router.get('/', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), async (req, res) => {
  console.log('[API GET /users] Fetching all user records...');
  try {
    const db = await getConnection();
    try {
      const rows = await db.queryAll(`
        SELECT u.*, c.company_name
        FROM users u
        LEFT JOIN customers c ON u.customer_id = c.id
        ORDER BY u.created_at ASC
      `);
      if (rows && rows.length > 0) {
        console.log(`[API GET /users] Loaded ${rows.length} rows from PostgreSQL database.`);
        return res.json(rows);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /users] DB query failed, returning seed fallback:', err.message);
  }
  return res.json(seed.USERS);
});

// GET /api/users/:id
router.get('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  console.log(`[API GET /users/${id}] Querying single user...`);
  try {
    const db = await getConnection();
    try {
      const user = await db.queryOne(`
        SELECT u.*, c.company_name
        FROM users u
        LEFT JOIN customers c ON u.customer_id = c.id
        WHERE u.id::text = $1 OR u.email = $1
      `, [id]);
      if (user) {
        return res.json(user);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn(`[API GET /users/${id}] DB query failed:`, err.message);
  }

  const user = seed.USERS.find((u) => u.id === id || u.email === id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json(user);
});

const isUUID = (str) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

// POST /api/users - Insert new user into PostgreSQL DB
router.post('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { full_name, email, phone_number, role, password, customer_id } = req.body;
  console.log('[API POST /users] Received request to create new user:', { full_name, email, phone_number, role, customer_id });

  if (!email || !email.trim()) {
    console.warn('[API POST /users] Validation failed: Email is missing.');
    return res.status(400).json({ message: 'Email address is required.' });
  }

  if (!phone_number || !phone_number.trim()) {
    console.warn('[API POST /users] Validation failed: Phone number is missing.');
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone_number.trim();
  const phoneDigits = cleanPhone.replace(/\D/g, '');

  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    console.warn(`[API POST /users] Validation failed: Invalid phone format (${cleanPhone}).`);
    return res.status(400).json({ message: 'Please enter a valid phone number (7 to 15 digits, e.g. +917383359679).' });
  }

  const passHash = bcrypt.hashSync(password || 'Darshan@1234', 10);
  const userRole = role || 'sales_rep';
  const name = full_name || 'New User';
  const validCustomerId = customer_id && isUUID(customer_id) ? customer_id : null;

  // Check if user already exists in PostgreSQL database by email
  try {
    const db = await getConnection();
    try {
      const existingUser = await db.queryOne('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
      if (existingUser) {
        console.warn(`[API POST /users] Duplicate email rejected: ${cleanEmail}`);
        return res.status(400).json({ message: `An account with email "${cleanEmail}" already exists in the database.` });
      }
    } finally {
      db.release();
    }
  } catch (checkErr) {
    console.warn('[API POST /users] DB pre-check warning:', checkErr.message);
  }

  // Also check seed USERS array for email uniqueness
  const seedExisting = seed.USERS.find((u) => u && u.email && u.email.toLowerCase() === cleanEmail);
  if (seedExisting) {
    console.warn(`[API POST /users] Duplicate email rejected from seed: ${cleanEmail}`);
    return res.status(400).json({ message: `An account with email "${cleanEmail}" already exists.` });
  }

  let createdUser = null;
  let dbError = null;

  try {
    const db = await getConnection();
    try {
      console.log('[API POST /users] Executing INSERT query into PostgreSQL users table...');
      const insertQuery = `
        INSERT INTO users (full_name, email, phone_number, role, password_hash, is_active, customer_id)
        VALUES ($1, $2, $3, $4::user_role, $5, true, $6)
        RETURNING *
      `;
      createdUser = await db.queryOne(insertQuery, [name, cleanEmail, cleanPhone, userRole, passHash, validCustomerId]);
      if (createdUser) {
        console.log('[API POST /users] PostgreSQL INSERT SUCCESSFUL:', createdUser);
      }
    } catch (insertErr) {
      dbError = insertErr.message;
      const errStr = String(insertErr.message || '').toLowerCase();
      if (errStr.includes('unique constraint') || errStr.includes('duplicate key') || insertErr.code === '23505') {
        console.warn('[API POST /users] Unique constraint error:', insertErr.message);
        return res.status(400).json({ message: `An account with email "${cleanEmail}" already exists in the database.` });
      }
      console.error('[API POST /users] PostgreSQL INSERT with ::user_role failed:', insertErr.message);
      // Fallback query if role column is text type
      try {
        const fallbackQuery = `
          INSERT INTO users (full_name, email, phone_number, role, password_hash, is_active, customer_id)
          VALUES ($1, $2, $3, $4, $5, true, $6)
          RETURNING *
        `;
        createdUser = await db.queryOne(fallbackQuery, [name, cleanEmail, cleanPhone, userRole, passHash, validCustomerId]);
        if (createdUser) {
          console.log('[API POST /users] PostgreSQL Fallback INSERT SUCCESSFUL:', createdUser);
        }
      } catch (fallbackErr) {
        dbError = fallbackErr.message;
        const fbErrStr = String(fallbackErr.message || '').toLowerCase();
        if (fbErrStr.includes('unique constraint') || fbErrStr.includes('duplicate key') || fallbackErr.code === '23505') {
          console.warn('[API POST /users] Unique constraint error in fallback:', fallbackErr.message);
          return res.status(400).json({ message: `An account with email "${cleanEmail}" already exists in the database.` });
        }
        console.error('[API POST /users] PostgreSQL Fallback INSERT failed:', fallbackErr.message);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.error('[API POST /users] PostgreSQL Pool connection error:', err.message);
    dbError = err.message;
  }

  if (!createdUser) {
    console.error('[API POST /users] DB Insertion failed, returning 400 error response.');
    return res.status(400).json({ message: `Failed to create user in database: ${dbError || 'Email already exists.'}` });
  }

  // Also sync to seed.USERS array in memory
  seed.USERS.push(createdUser);

  console.log('[API POST /users] Successfully created and returning user:', createdUser);
  return res.status(201).json(createdUser);
});

// PUT /api/users/:id - Update user in PostgreSQL DB
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'sales_manager'), async (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone_number, role, is_active, customer_id } = req.body;
  console.log(`[API PUT /users/${id}] Updating user record...`, req.body);

  // Pre-check for duplicate email across other users
  try {
    const db = await getConnection();
    try {
      if (email && email.trim()) {
        const dupEmail = await db.queryOne('SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND id::text != $2', [email.trim(), id]);
        if (dupEmail) {
          return res.status(400).json({ message: `Email "${email.trim()}" is already assigned to another user account.` });
        }
      }
    } finally {
      db.release();
    }
  } catch (checkErr) {
    console.warn('[API PUT /users] Pre-check warning:', checkErr.message);
  }

  const validCustomerId = customer_id !== undefined ? (customer_id && isUUID(customer_id) ? customer_id : null) : undefined;

  let updatedUser = null;
  try {
    const db = await getConnection();
    try {
      let updateQuery;
      let params;
      if (validCustomerId !== undefined) {
        updateQuery = `
          UPDATE users
          SET full_name = COALESCE($1, full_name),
              email = COALESCE($2, email),
              phone_number = COALESCE($3, phone_number),
              role = COALESCE($4::user_role, role),
              is_active = COALESCE($5, is_active),
              customer_id = $6,
              updated_at = NOW()
          WHERE id::text = $7 OR email = $2
          RETURNING *
        `;
        params = [full_name, email, phone_number, role, is_active, validCustomerId, id];
      } else {
        updateQuery = `
          UPDATE users
          SET full_name = COALESCE($1, full_name),
              email = COALESCE($2, email),
              phone_number = COALESCE($3, phone_number),
              role = COALESCE($4::user_role, role),
              is_active = COALESCE($5, is_active),
              updated_at = NOW()
          WHERE id::text = $6 OR email = $2
          RETURNING *
        `;
        params = [full_name, email, phone_number, role, is_active, id];
      }
      const result = await db.queryOne(updateQuery, params);
      if (result) {
        console.log('[API PUT /users] PostgreSQL UPDATE SUCCESSFUL:', result);
        updatedUser = result;
      }
    } catch (dbErr) {
      console.warn('[API PUT /users] PostgreSQL UPDATE error:', dbErr.message);
    } finally {
      db.release();
    }
  } catch (err) {
    console.error('[API PUT /users] PostgreSQL connection error:', err.message);
  }

  // Sync in-memory seed data
  const user = seed.USERS.find((u) => u.id === id || (email && u.email === email));
  if (user) {
    if (full_name !== undefined) user.full_name = full_name;
    if (email !== undefined) user.email = email;
    if (phone_number !== undefined) user.phone_number = phone_number;
    if (role !== undefined) user.role = role;
    if (is_active !== undefined) user.is_active = is_active;
    if (validCustomerId !== undefined) user.customer_id = validCustomerId;
    if (!updatedUser) updatedUser = user;
  }

  return res.json(updatedUser || { message: 'User updated successfully.' });
});

// POST /api/users/:id/reset-password - Admin reset password for a user
router.post('/:id/reset-password', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { new_password } = req.body;
  console.log(`[API POST /users/${id}/reset-password] Resetting user password...`);

  if (!new_password || new_password.trim().length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
  }

  const passHash = bcrypt.hashSync(new_password.trim(), 10);
  let updatedUser = null;

  try {
    const db = await getConnection();
    try {
      const updateQuery = `
        UPDATE users
        SET password_hash = $1, updated_at = NOW()
        WHERE id::text = $2
        RETURNING id, full_name, email, role, is_active, updated_at
      `;
      updatedUser = await db.queryOne(updateQuery, [passHash, id]);
      if (updatedUser) {
        console.log(`[API POST /users/${id}/reset-password] Password updated in DB successfully.`);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn(`[API POST /users/${id}/reset-password] DB update failed:`, err.message);
  }

  const seedUser = seed.USERS.find((u) => u.id === id);
  if (seedUser) {
    seedUser.password_hash = passHash;
  }

  return res.json({ message: 'User password reset successfully.', user: updatedUser });
});

// PATCH /api/users/:id/status - Update active status in PostgreSQL DB
router.patch('/:id/status', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  console.log(`[API PATCH /users/${id}/status] Updating status to ${is_active}...`);

  let updatedUser = null;
  try {
    const db = await getConnection();
    try {
      const updateQuery = `
        UPDATE users
        SET is_active = $1
        WHERE id::text = $2
        RETURNING *
      `;
      const result = await db.queryOne(updateQuery, [is_active, id]);
      if (result) {
        console.log('[API PATCH /users/status] PostgreSQL STATUS UPDATE SUCCESSFUL:', result);
        updatedUser = result;
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API PATCH /users/status] PostgreSQL status update failed:', err.message);
  }

  const user = seed.USERS.find((u) => u.id === id);
  if (user) {
    user.is_active = is_active !== undefined ? is_active : !user.is_active;
    if (!updatedUser) updatedUser = user;
  }

  return res.json({ message: 'User status updated successfully', user: updatedUser });
});

// DELETE /api/users/:id - Delete user from PostgreSQL DB
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  console.log(`[API DELETE /users/${id}] Deleting user...`);
  let deletedUser = null;

  try {
    const db = await getConnection();
    try {
      const result = await db.queryOne('DELETE FROM users WHERE id::text = $1 RETURNING *', [id]);
      if (result) {
        console.log('[API DELETE /users] PostgreSQL DELETE SUCCESSFUL:', result);
        deletedUser = result;
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API DELETE /users] PostgreSQL delete failed:', err.message);
  }

  const index = seed.USERS.findIndex((u) => u.id === id);
  if (index !== -1) {
    const deleted = seed.USERS.splice(index, 1)[0];
    if (!deletedUser) deletedUser = deleted;
  }

  return res.json({ message: 'User deleted successfully from database.', user: deletedUser });
});

module.exports = router;

