const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

// Create recipes table
db.run(`CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  title TEXT,
  category TEXT,
  instructions TEXT,
  image TEXT,
  FOREIGN KEY(userId) REFERENCES users(id)
)`);

// Routes
const userRoutes = require('./routes/userRoutes')(db, jwt, bcrypt);
const recipeRoutes = require('./routes/recipeRoutes')(db, jwt);

app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
