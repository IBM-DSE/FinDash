const db2 = (process.env.DB_HOST && process.env.DB_PORT &&
             process.env.DB_USER && process.env.DB_PASS &&
             process.env.DB_BASE);

module.exports = db2 ? require('./stocks_db2') : require('./stocks_sqlite');
