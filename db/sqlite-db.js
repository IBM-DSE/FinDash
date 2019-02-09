const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
const fs = require('fs');
const path = require('path');
const csv_parse = require('csv-parse');

function loadDataFile(dataFile, tableName, fileOptions={}) {
  const csvPath = path.join(__dirname, 'data', dataFile);//NewsDataForDB2
  fs.readFile(csvPath, 'utf8', function(err, file_data) {
    csv_parse(file_data, fileOptions, (err, table) => {
      if (err)
        console.error(err);

      else {

        const colNames = table[0];

        db.serialize(function () {

          db.run(`CREATE TABLE ${tableName} (` + colNames.map(col => `${col} TEXT`).join(',') + ')');

          const placeholders = colNames.map(() => '?').join(',');
          const stmt = db.prepare(`INSERT INTO ${tableName} VALUES (${placeholders})`);
          for (let row of table.slice(1)) {
            stmt.run(row)
          }
          stmt.finalize();

        });
      }
    });
  });
}

const customerDataFile = 'brokerage_cust.csv';
const customerTableName = 'BROKERAGE_CUST';
loadDataFile(customerDataFile, customerTableName);

const stockDataFile = 'stock_trades.csv';
const stockTableName = 'STOCK_TRADES';
loadDataFile(stockDataFile, stockTableName);

const newsDataFile = 'stock_news.csv';
const newsFileOptions = {delimiter: '|', comment: '#', quote: false};
const newsTableName = 'NEWS';
loadDataFile(newsDataFile, newsTableName, newsFileOptions);


module.exports = {
  queryDatabase: (statement, callback) => {
    db.all(statement, (err, result) => {
      if(err) console.error(err);
      callback(result)
    });
  }
};

process.on('exit', (code) => {
  console.log(`About to exit with code: ${code}`);
  db.close(err => err ? console.error(err.message) : console.log('Closed the database connection.'));
});
