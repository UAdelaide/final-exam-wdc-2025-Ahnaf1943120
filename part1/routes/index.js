var express = require('express');
var router = express.Router();
const db = require('../models/db'); // Adjust the path as necessary

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/dogs', async (req, res) =>  {
  try {
    const query =`
  SELECT d.name AS dog_name, size, u.username AS owner_username
  FROM Dogs d
  JOIN Users u ON d.owner_id = u.user_id`;

  const [dogs] = await db.query(query);

  res.json(dogs);
  } catch (error) {
    console.error('Error fetching dogs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/api/walkrequests/open', async (req, res) => {
  try {
  const query =`
  SELECT
    w.request_id, d.name AS dog_name, w.requested_time, w.duration_minutes, w.location, u.username AS owner_username
  FROM WalkRequests w
  JOIN Dogs d ON d.dog_id = w.dog_id
  JOIN Users u ON d.owner_id = u.user_id
  WHERE w.status = 'open'`;

  const [requests] = await db.query(query);

  res.json(requests);
  } catch (error) {
    console.error('Error fetching walkrequests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/walkers/summary', async (req, res) => {
  try {
    const query = `
      SELECT
        u.username AS walker_username,
        COUNT(r.rating_id) AS total_ratings,
        ROUND(AVG(r.rating), 1) AS average_rating, COUNT(CASE WHEN w.status = 'completed' THEN 1 END) AS completed_walks
      FROM
        Users u
      LEFT JOIN WalkApplications a ON u.user_id = a.walker_id
      LEFT JOIN WalkRequests w ON a.request_id = w.request_id AND w.status = 'completed'
      LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
      WHERE
        u.role = 'walker'
      GROUP BY
        u.username
      ORDER BY
        u.username
    `;

    const [summary] = await db.query(query);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
