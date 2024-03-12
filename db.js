require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.MARIADBHOST,
    port: 3306,
    user: 'root',
    password: process.env.MARIADBUSERPASSWORD,
    database: 'crm_fastpay',
});

/* const pool = mysql.createPool({
    host: process.env.LOCALMYSQLHOST,
    port: 3306,
    user: 'root',
    password: process.env.MYSQLUSERPASSWORD,
    database: 'fastpayment_test',
}); */



module.exports = pool;