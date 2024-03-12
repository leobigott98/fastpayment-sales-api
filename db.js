require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: '34.170.145.243',
    port: 3306,
    user: 'root',
    password: process.env.MARIADBUSERPASSWORD,
    database: 'crm_fastpay',
});

/* const pool = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'L30n4rd01705',
    database: 'fastpayment_test',
}); */



module.exports = pool;