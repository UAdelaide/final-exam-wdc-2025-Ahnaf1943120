const express = require('express');
const path = require('path');
const session = require('express-session');
const PORT = process.env.PORT || 3000;

require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secretDogKey',
  resave: false,
  saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);




app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// Export the app instead of listening here
module.exports = app;
  
