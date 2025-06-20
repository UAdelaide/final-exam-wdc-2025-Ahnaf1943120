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
  SELECT
    d.name AS dog_name,
    size,
    u.username AS owner_username
  FROM
    Dogs d
  JOIN
    Users u ON d.owner_id = u.user_id`;

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
    w.request_id,
    d.name AS dog_name,
    w.requested_time,
    w.duration_minutes,
    w.location,
    u.username AS owner_username
  FROM
    WalkRequests w
  JOIN
    Dogs d ON d.dog_id = w.dog_id
  JOIN
    Users u ON d.owner_id = u.user_id
  WHERE
    w.status = 'open'
  `;

  const [requests] = await db.query(query);

  res.json(requests);
  } catch (error) {
    console.error('Error fetching walkrequests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
