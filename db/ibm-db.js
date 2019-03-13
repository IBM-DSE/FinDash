let ibmDB = require("ibm_db");

const connString =
  ";HOSTNAME="+process.env.DB_HOST+";PORT="+process.env.DB_PORT+
  ";UID="     +process.env.DB_USER+";PWD=" +process.env.DB_PASS+
  ";DATABASE="+process.env.DB_BASE+";PROTOCOL=TCPIP";

let connected = false;

if(process.env.DB_HOST && process.env.DB_PORT && process.env.DB_USER && process.env.DB_PASS && process.env.DB_BASE) {
  connected = true;
  console.log(`Connected to ${process.env.DB_HOST}:${process.env.DB_BASE}`)
} else {
  console.error('Missing Database ');
}

module.exports.queryDatabase = function (statement, callback){

  if(!connected)
    return console.error('Missing Database ');

  ibmDB.open(connString, function (err, conn) {
    if (err) return console.error(err);

    conn.query(statement, function (err, data) {
      if (err)
        console.error(err);
      else
        callback(data);

      conn.close();
    });
  });
};
