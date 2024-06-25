const express = require('express');

module.exports = (db, jwt) => {
  const router = express.Router();

  router.use((req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) {
      return res.status(403).send({ auth: false, message: 'No token provided.' });
    }

    jwt.verify(token, 'supersecret', (err, decoded) => {
      if (err) {
        return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      }

      req.userId = decoded.id;
      next();
    });
  });

  router.post('/', (req, res) => {
    const { title, category, instructions, image } = req.body;
    db.run(`INSERT INTO recipes (userId, title, category, instructions, image) VALUES (?, ?, ?, ?, ?)`, [req.userId, title, category, instructions, image], function(err) {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.status(201).send({ id: this.lastID });
    });
  });

  router.get('/', (req, res) => {
    db.all(`SELECT * FROM recipes WHERE userId = ?`, [req.userId], (err, rows) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.status(200).json(rows);
    });
  });

  router.delete('/:id', (req, res) => {
    const recipeId = req.params.id;
    db.run(`DELETE FROM recipes WHERE id = ? AND userId = ?`, [recipeId, req.userId], function(err) {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.status(200).send({ message: 'Recipe deleted' });
    });
  });

  router.put('/:id', (req, res) => {
    const recipeId = req.params.id;
    const { title, category, instructions, image } = req.body;
    db.run(`UPDATE recipes SET title = ?, category = ?, instructions = ?, image = ? WHERE id = ? AND userId = ?`, [title, category, instructions, image, recipeId, req.userId], function(err) {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.status(200).send({ message: 'Recipe updated' });
    });
  });

  return router;
};
