const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS for frontend-backend communication
app.use(cors());

// Connect to the SQLite database
const db = new sqlite3.Database('./db/provinces.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Endpoint to get all provinces
app.get('/api/provinces', (req, res) => {
  db.all('SELECT * FROM provinces', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Endpoint to get province details by name
app.get('/api/provinces/:name', (req, res) => {
  const provinceName = req.params.name;
  db.get(
    `SELECT * FROM provinces WHERE name = ?`,
    [provinceName],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (!row) {
        res.status(404).json({ error: 'Province not found' });
      } else {
        // Fetch languages for the province
        db.all(
          `SELECT l.name, pl.percentage
           FROM province_languages pl
           JOIN languages l ON pl.language_id = l.language_id
           WHERE pl.province_id = ?`,
          [row.province_id],
          (err, languages) => {
            if (err) {
              res.status(500).json({ error: err.message });
            } else {
              row.languages = languages;
              res.json(row);
            }
          }
        );
      }
    }
  );
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});