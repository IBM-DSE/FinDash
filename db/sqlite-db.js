const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
const fs = require('fs');
const path = require('path');
const csv_parse = require('csv-parse');

function getNews(callback) {
  const csvPath = path.join(__dirname, 'data', 'stock_news.csv');//NewsDataForDB2
  fs.readFile(csvPath, 'utf8', function(err, file_data) {
    csv_parse(file_data, {delimiter: '|', comment: '#', quote: false}, callback);
  });
}

getNews((err, table) => {
  if (err)
    console.error(err);

  else {

    const colNames = table[0];

    db.serialize(function () {

      db.run('CREATE TABLE news (' + colNames.map(col => `${col} TEXT`).join(',') + ')');

      const placeholders = colNames.map(() => '?').join(',');
      const stmt = db.prepare(`INSERT INTO news VALUES (${placeholders})`);
      for (let row of table.slice(1)) {
        stmt.run(row)
      }
      stmt.finalize();

    });

  }
});


const selectStatement = 'SELECT * FROM news LIMIT 6';


module.exports = {
  queryDatabase: (statement, callback) => {
    db.all(selectStatement, (err, result) => {
      if(err) console.error(err);
      callback(result)
    });
  }
};

process.on('exit', (code) => {
  console.log(`About to exit with code: ${code}`);
  db.close(err => err ? console.error(err.message) : console.log('Closed the database connection.'));
});
