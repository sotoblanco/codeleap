// Simple script to view feedback entries in the database
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open the database
const db = new sqlite3.Database(path.join(__dirname, '../data/codeleap.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the codeleap database.');
});

// Query all feedback entries
db.all('SELECT * FROM feedback ORDER BY timestamp DESC', [], (err, rows) => {
  if (err) {
    console.error('Error querying database:', err.message);
    return;
  }
  
  console.log('Feedback entries found:', rows.length);
  console.log('-----------------------------');
  
  if (rows.length === 0) {
    console.log('No feedback entries found.');
  } else {
    rows.forEach((row, i) => {
      console.log(`Entry #${i+1}:`);
      console.log(`ID: ${row.id}`);
      console.log(`Timestamp: ${row.timestamp}`);
      console.log(`Plan ID: ${row.plan_id}`);
      console.log(`Step ID: ${row.step_id || 'N/A'}`);
      console.log(`Rating: ${row.rating}`);
      console.log(`Comment: ${row.comment || 'N/A'}`);
      console.log(`User ID: ${row.user_id}`);
      console.log('-----------------------------');
    });
  }
  
  // Close the database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
}); 