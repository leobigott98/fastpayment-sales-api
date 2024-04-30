require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();

const saveToSQLite = (token, timestamp, callback)=>{
    const db = new sqlite3.Database('./db/tranred.db');
    db.serialize(function () {
        db.run('CREATE TABLE IF NOT EXISTS tranred_tokens(token TEXT, timestamp TEXT)');
        db.run('INSERT INTO tranred_tokens(token, timestamp) VALUES (?,?)', [token, timestamp], function(err){
            if(err) {
                return console.log(err.message)
            }
            console.log(`inserted with rowid ${this.lastID}`);
            callback()
        }) 
        db.close();
    })  
}

/* const current = Date.now()

saveToSQLite(process.env.TRANRED_TOKEN, current, ()=>{console.log('saved')} )  */


/* const getToken = () => {
  const db = new sqlite3.Database("./db/tranred.db");
  db.all(`SELECT * FROM tranred_tokens `, function (err, rows) {
        if (err) {return console.log(err.message)};
        console.log(rows)
      })
    db.close();
}; */

 //getToken()

const update = ()=>{
    const current = Date.now()
    const newTime = current + (1*60*1000)
    const db = new sqlite3.Database('./db/tranred.db');
    db.run(`UPDATE tranred_tokens SET timestamp = ${newTime} WHERE rowid = 1`, function(err){
        if(err){
            return console.log(err.message)
        }
    })
}

const deleteTokens = ()=>{
    const db = new sqlite3.Database('./db/tranred.db');
    db.run('DELETE FROM tranred_tokens', function(err){
        if(err){
            return console.log(err.message)
        }
        console.log('deleted')
    })
}

module.exports = {saveToSQLite, deleteTokens, update};  