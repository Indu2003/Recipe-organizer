const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = (db, jwt, bcrypt) => {
  const router = express.Router();

  router.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
      if (err) {
        return res.status(500).send("There was a problem registering the user.")
      }
      const token = jwt.sign({ id: this.lastID }, 'supersecret', { expiresIn: 86400 });
      res.status(200).send({ auth: true, token });
    });
  });

  router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
      if (err) {
        return res.status(500).send('Error on the server.');
      }
      if (!user) {
        return res.status(404).send('No user found.');
      }

      const passwordIsValid = bcrypt.compareSync(password, user.password);
      if (!passwordIsValid) {
        return res.status(401).send({ auth: false, token: null });
      }

      const token = jwt.sign({ id: user.id }, 'supersecret', { expiresIn: 86400 });
      res.status(200).send({ auth: true, token });
    });
  });

  return router;
};
