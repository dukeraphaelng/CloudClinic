// Essential packages
const express = require('express');

// Subimportant packages
const dotenv = require('dotenv');
const path = require('path');

// Access dotenv
dotenv.config({ path: './config/config.env' });

// Import Routes
const usersRoute = require('./src/routes/users');
const sessionsRoute = require('./src/routes/sessions');
const samplePrivateRoute = require('./src/routes/samplePrivate');

// Create instance of express
const app = express();

// Connect to MongoDB with Mongoose
require('./config/mongodb');

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
    return res.status(200).json({});
  }
});

// Add a single baseUrl Route ('/api') here for DRY

// Route Middlewares
app.use('/api/users', usersRoute);
app.use('/api/sessions', sessionsRoute);
app.use('/api/sample-private', samplePrivateRoute);

// Default Route
app.get('/api', (req, res) => res.send('Hello world!'));

// Concurrent Mode in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/build'));

  app.get('*', (req, res) =>
    res.sendFile(
      path.resolve(__dirname, '../', 'frontend', 'build', 'index.html')
    )
  );
}

module.exports = app;
