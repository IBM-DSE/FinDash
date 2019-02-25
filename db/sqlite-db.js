const path = require('path');
const fs = require('fs');
const csv_parse = require('csv-parse');
const stream = require('stream');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
const nodeCleanup = require('node-cleanup');


class TableLoadStream extends stream.Writable {
  constructor(tableName) {
    super({objectMode: true});
    this.tableName = tableName;
    this.header = true;
    this.stmt = null;
    this.startTime = null;
  }

  _write(row, enc, next) {
    if(this.header){
      this.startTime = new Date();

      const createStatement = `CREATE TABLE ${this.tableName} ( ${row.map(col => `${col} TEXT`).join(' , ')} )`;
      console.log(createStatement+'\n');
      db.run(createStatement);

      const placeholders = row.map(() => '?').join(',');
      this.stmt = db.prepare(`INSERT INTO ${this.tableName} VALUES (${placeholders})`);

      this.header = false;
      next();
    } else {
      this.stmt.run(row);
      next();
    }
  }

  _final() {
    const elapsed = (new Date() - this.startTime)/1000;
    db.get(`SELECT COUNT(*) FROM ${this.tableName}`, (err, res) => {
      this.stmt.finalize(() => console.log(`Loaded ${res['COUNT(*)']} rows into ${this.tableName} in ${elapsed} seconds`))
    });
  }
}


function loadDataFile(dataFile, tableName, fileOptions={}) {

  const csvPath = path.join(__dirname, 'data', dataFile);
  const finalOptions = Object.assign({skip_lines_with_error: true}, fileOptions);
  const tableLoadStream = new TableLoadStream(tableName);

  fs.createReadStream(csvPath)
    .pipe(csv_parse(finalOptions))
    .on('data', row => { db.serialize(() => tableLoadStream.write(row) ) })
    .on('end', () => tableLoadStream.end())
}


loadDataFile('brokerage_cust.csv', 'BROKERAGE_CUST');
loadDataFile('stock_trades.csv', 'STOCK_TRADES');
loadDataFile('currency_rates.csv', 'CURRENCY_RATES');
loadDataFile('NewsData.csv', 'NEWS', {delimiter: '|', comment: '#', quote: false});


module.exports = {
  queryDatabase: (statement, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = []
    }
    db.all(statement, params, (err, result) => {
      if(err) {
        console.error('\nThe following statement produced an error:\n');
        console.error(statement);
        console.error(JSON.stringify(params)+'\n');
        console.error(err+'\n');
        callback([])
      } else
        callback(result)
    });
  }
};

nodeCleanup(function (exitCode, signal) {
  if (signal) {
    db.close(err => {
      if(err)
        console.error(err.message);
      else
        console.log('\nClosed the database connection.');
      process.kill(process.pid, signal);
    });
    nodeCleanup.uninstall(); // don't call cleanup handler again
    return false;
  }
});
