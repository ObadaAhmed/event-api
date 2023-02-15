require('dotenv').config();
const pool = require('../config/db_config');
exports.sendJsonResponse = (res, data, status) => {
    res.status(status);
    res.send(data);
}

exports.excuteQuery = (sqlQuery , parameters) => {
    pool.query(sqlQuery , parameters , (err , result) => {
        if (err) return err
        return result
    })
}


