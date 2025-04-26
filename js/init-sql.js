const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database
const db = new sqlite3.Database('./db/provinces.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');
});

// Read the JSON file
const jsonFilePath = './data/provinces.json';
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err.message);
    return;
  }

  const provinces = JSON.parse(data);
  let pendingOperations = 0; // Counter to track pending operations

  provinces.forEach((province) => {
    pendingOperations++; // Increment for each province operation

    // Insert into provinces table
    db.run(
      `INSERT INTO provinces (name, description, image) VALUES (?, ?, ?)`,
      [province.province, province.description, province.image],
      function (err) {
        if (err) {
          console.error('Error inserting province:', err.message);
          pendingOperations--; // Decrement counter on error
          checkCompletion();
          return;
        }

        const provinceId = this.lastID; // Get the inserted province ID

        // Insert languages into the languages table and province_languages table
        province.languages.forEach((language) => {
          pendingOperations++; // Increment for each language operation

          db.run(
            `INSERT OR IGNORE INTO languages (name) VALUES (?)`,
            [language],
            function (err) {
              if (err) {
                console.error('Error inserting language:', err.message);
                pendingOperations--; // Decrement counter on error
                checkCompletion();
                return;
              }

              // Get the language ID (either from the current insert or existing entry)
              const languageId = this.lastID || (() => {
                let id;
                db.get(
                  `SELECT language_id FROM languages WHERE name = ?`,
                  [language],
                  (err, row) => {
                    if (err) {
                      console.error('Error fetching language ID:', err.message);
                    } else {
                      id = row.language_id;
                    }
                  }
                );
                return id;
              })();

              // Insert into province_languages table
              const percentage = province.language_percentages[language] || 0;
              db.run(
                `INSERT OR IGNORE INTO province_languages (province_id, language_id, percentage) VALUES (?, ?, ?)`,
                [provinceId, languageId, percentage],
                (err) => {
                  if (err) {
                    console.error('Error inserting province_languages:', err.message);
                  }
                  pendingOperations--; // Decrement counter after operation
                  checkCompletion();
                }
              );
            }
          );
        });

        pendingOperations--; // Decrement counter after province operation
        checkCompletion();
      }
    );
  });

  // Function to check if all operations are complete
  function checkCompletion() {
    if (pendingOperations === 0) {
      console.log('All data inserted successfully.');
      db.close((err) => {
        if (err) {
          console.error('Error closing the database:', err.message);
        } else {
          console.log('Database connection closed.');
        }
      });
    }
  }
});