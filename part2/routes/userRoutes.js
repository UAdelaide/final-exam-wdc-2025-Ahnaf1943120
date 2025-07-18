const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Adjust the path as necessary

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});


// POST /api/users/login
router.post('/login', async (req, res) => {
  // Fetch username and password from request body
  const { username, password } = req.body;

  try {
    // QUERY the database for user credentials
    const [rows] = await db.query(
      'SELECT user_id, username, role FROM Users WHERE username = ? AND password_hash = ?',
      [username, password]
    );
    // debugging output
    console.log('DB rows returned:', rows);
    // If no user found, return error
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = rows[0];

    // Redirect based on role
    if (rows[0].role === 'owner') {
      return res.redirect('/owner-dashboard.html');
    } else if (rows[0].role === 'walker') {
      return res.redirect('/walker-dashboard.html');
    } else {
      return res.status(400).send('Unknown user role');
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



// Logout route: destroys session and redirects to login
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

router.get('/mydogs', async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  try {
    // Fetch dogs for the logged-in user
    const [rows] = await db.query(
      'Select dog_id, name FROM Dogs WHERE owner_id = ?',
      [req.session.user.user_id] // Use the user_id from the session
    );
    // return the list of dogs
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});
module.exports = router;
