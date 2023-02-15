const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit : 100,
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'event-system',
    debug    :  false
});
module.exports = pool;
