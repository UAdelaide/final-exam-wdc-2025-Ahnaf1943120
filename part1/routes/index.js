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



module.exports = router;
