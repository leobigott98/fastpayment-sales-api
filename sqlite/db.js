require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();

const saveTokenToSQLite = (token, timestamp, callback) => {
  const db = new sqlite3.Database("./sqlite/tranred.db");
  db.serialize(function () {
    db.run(
      "CREATE TABLE IF NOT EXISTS tranred_tokens(token TEXT, timestamp TEXT)"
    );
    db.run(
      "INSERT INTO tranred_tokens(token, timestamp) VALUES (?,?)",
      [token, timestamp],
      function (err) {
        if (err) {
          return console.log(err.message);
        }
        console.log(`inserted with rowid ${this.lastID}`);
        callback();
      }
    );
    db.close();
  });
};

const savePlansToSQLite = (array, callback) => {
  const db = new sqlite3.Database("./sqlite/tranred.db");

  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS tranred_plans (id NUMBER, name TEXT, timestamp TEXT)"
    );
    db.run("DELETE FROM tranred_plans", function (err) {
      if (err) {
        return console.log(err.message);
      }
      console.log("deleted");
    });

    const stmt = db.prepare("INSERT INTO tranred_plans VALUES (?, ?, ?)");
    for (let i = 0; i < array.length; i++) {
      const timestamp = Date.now();
      stmt.run([array[i].a_planId, array[i].a_planNombre, timestamp]);
    }
    stmt.finalize();
    db.each(
      "SELECT rowid, id, name, timestamp FROM tranred_plans",
      (err, row) => {
        console.log(row.id + ": " + row.name);
      }
    );
  });

  db.close();
  callback();
};

/* const getTranredPlans = (callback) => {
  const db = new sqlite3.Database("./db/tranred.db");
  db.all(`SELECT * FROM tranred_plans `, function (err, rows) {
    if (err) {
      return console.log(err.message);
    }
    console.log(rows);
  });
  db.close();
  callback();
}; */

/* const current = Date.now()

saveToSQLite(process.env.TRANRED_TOKEN, current, ()=>{console.log('saved')} ) 


/* const getToken = () => {
  const db = new sqlite3.Database("./db/tranred.db");
  db.all(`SELECT * FROM tranred_tokens `, function (err, rows) {
        if (err) {return console.log(err.message)};
        console.log(rows)
      })
    db.close();
};

 getToken() */

const update = () => {
  const current = Date.now();
  const newTime = current + 1 * 60 * 1000;
  const db = new sqlite3.Database("./db/tranred.db");
  db.run(
    `UPDATE tranred_tokens SET timestamp = ${newTime} WHERE rowid = 1`,
    function (err) {
      if (err) {
        return console.log(err.message);
      }
    }
  );
};

const deleteTokens = () => {
  const db = new sqlite3.Database("./sqlite/tranred.db");
  db.run("DELETE FROM tranred_tokens", function (err) {
    if (err) {
      return console.log(err.message);
    }
    console.log("deleted");
  });
};

module.exports = { saveTokenToSQLite, deleteTokens, update, savePlansToSQLite };

/* const tzoffset = (new Date()).getTimezoneOffset() * 60000;
const current = new Date(Date.now() - tzoffset)
const timeString = current.toISOString().slice(0,current.toISOString().indexOf("T")).concat(" ", current.toISOString().slice((current.toISOString().indexOf("T")+1),current.toISOString().indexOf(".")))
console.log(timeString); */
