const pool = require('../config/db_config');
const Joi = require('joi')
const {sendJsonResponse} = require("../utils/common_utils");
const {sendNotificationEmail , sendEmail , broadcastEmail } = require("../utils/HelperClass")
const STATUS_SUCCESS = true
const STATUS_ERROR = false

module.exports.add = (req,res) => {
    try {
        const schema = Joi.object({
            name: Joi.string().min(3).max(100).required(),
            description: Joi.string().required(),
            start_date: Joi.date().required(),
            end_date: Joi.date(),
            companyId: Joi.number().required()
        });

        let { error , value } = schema.validate(req.body);

        if (error) {
            sendJsonResponse(res , {
                status : STATUS_ERROR ,
                errorMessage : error.details[0].message
            } , 400);
        }else {
            let insertQuery = `INSERT INTO company_events(name , description , start_date , end_date , company_id) values (?,?,?,?,?);`
            let parameters = [value.name , value.description , value.start_date , value.end_date , value.companyId];
            pool.query(insertQuery , parameters , (err , result) => {
                if (err) {
                    console.log(err);
                    sendJsonResponse(res , {
                        status : STATUS_ERROR ,
                        errorMessage : `something went wrong !!`
                    } , 500);
                }else {
                    if (result) {
                        sendJsonResponse(res , {
                            status : STATUS_SUCCESS ,
                            successMessage : `event ${value.name} saved successfully`
                        } , 201);
                        broadcastEmail(value.companyId , "test email")
                    }
                }
            })
        }

    } catch (err) {
        console.log(` error in adding event : ${err}`)
        sendJsonResponse(res , {
            status : STATUS_ERROR ,
            errorMessage : `something went wrong ${err}`
        } , 500);
    }
}
module.exports.bookEvent = (req,res) => {
    try {
        const schema = Joi.object({
            user_id: Joi.number().required(),
            event_id: Joi.number().required(),
           status: Joi.boolean().required()
        });

        let { error , value } = schema.validate(req.body);

        if (error) {
            sendJsonResponse(res , {
                status : STATUS_ERROR ,
                errorMessage : error.details[0].message
            } , 400);
        }else {
            let insertQuery = `INSERT INTO event_bookings(user_id , event_id , status) values (?,?,?);`
            let parameters = [value.user_id , value.event_id , value.status];
            pool.query(insertQuery , parameters , (err , result) => {
                if (err) {
                    sendJsonResponse(res , {
                        status : STATUS_ERROR ,
                        errorMessage : `already booked this event !!`
                    } , 200);
                }else {
                    if (result) {
                        sendJsonResponse(res , {
                            status : STATUS_SUCCESS ,
                            successMessage : `event  booked successfully`
                        } , 201);
                    }
                }
            })
        }

    } catch (err) {
        console.log(` error in book event : ${err}`)
        sendJsonResponse(res , {
            status : STATUS_ERROR ,
            errorMessage : `something went wrong ${err}`
        } , 500);
    }
}
module.exports.updateEvent = (req,res) => {
    try {
        const schema = Joi.object({
            name: Joi.string().min(3).max(100).required(),
            description: Joi.string().required(),
            start_date: Joi.date().required(),
            end_date: Joi.date(),
            companyId: Joi.number().required()
        });

        let { error , value } = schema.validate(req.body);

        if (error) {
            sendJsonResponse(res , {
                status : STATUS_ERROR ,
                errorMessage : error.details[0].message
            } , 400);
        }else {
            let insertQuery = `UPDATE company_events set name = ?  , description = ?  , start_date = ? , end_date = ?  WHERE company_id = ?`;
            let parameters = [value.name , value.description , value.start_date , value.end_date , value.companyId];
            pool.query(insertQuery , parameters , (err , result) => {
                if (err) {
                    console.log(err);
                    sendJsonResponse(res , {
                        status : STATUS_ERROR ,
                        errorMessage : `something went wrong !!`
                    } , 500);
                }else {
                    if (result) {
                        sendJsonResponse(res , {
                            status : STATUS_SUCCESS ,
                            successMessage : `event ${value.name} updated successfully`
                        } , 201);
                    }
                }
            })
        }

    } catch (err) {
        console.log(` error in update event : ${err}`)
        sendJsonResponse(res , {
            status : STATUS_ERROR ,
            errorMessage : `something went wrong ${err}`
        } , 500);
    }
}
module.exports.updateEventBookingStatus = (req,res) => {
    try {
        const schema = Joi.object({
            status : Joi.boolean().required(),
        });

        let { error , value } = schema.validate(req.body);

        if (error) {
            sendJsonResponse(res , {
                status : STATUS_ERROR ,
                errorMessage : error.details[0].message
            } , 400);
        }else {
            let insertQuery = `UPDATE company_events set name = ?  , description = ?  , start_date = ? , end_date = ?  WHERE company_id = ?`;
            let parameters = [value.name , value.description , value.start_date , value.end_date , value.companyId];
            pool.query(insertQuery , parameters , (err , result) => {
                if (err) {
                    console.log(err);
                    sendJsonResponse(res , {
                        status : STATUS_ERROR ,
                        errorMessage : `something went wrong !!`
                    } , 500);
                }else {
                    if (result) {
                        sendJsonResponse(res , {
                            status : STATUS_SUCCESS ,
                            successMessage : `event ${value.name} updated successfully`
                        } , 201);
                    }
                }
            })
        }

    } catch (err) {
        console.log(` error in update event : ${err}`)
        sendJsonResponse(res , {
            status : STATUS_ERROR ,
            errorMessage : `something went wrong ${err}`
        } , 500);
    }
}

module.exports.searchEvent = (req,res) => {
    try {
        const location = req.body.location || null;
        const name = req.body.name || null;
        const date = req.body.date || null;

       let searchQuery = `SELECT C.name as companyName , C.id as companyId , CE.name as eventName , location , description , start_date , end_date FROM company_events CE inner join company C on C.id = CE.company_id  `
        const searchValues = [];

       if (location || name || date) {
           searchQuery += ' WHERE '
       }

       if (location) {
           searchQuery +=  ` location = ? `;
           searchValues.push(location)
       }

        if (name) {
            if (location) {
                searchQuery += ' AND';
            }
            searchQuery += ' name = ?';
            searchValues.push(name);
        }

        if (date) {
            if (location || name) {
                searchQuery += ' AND';
            }
            searchQuery += ' start_date = ?';
            searchValues.push(date);
        }

        pool.query(searchQuery , searchValues , (err , result) => {
            if (err) {
                console.log(err);
                sendJsonResponse(res , {
                    status : STATUS_ERROR ,
                    errorMessage : `something went wrong !!`
                } , 500);
            }else {
                if (result.length != 0) {
                    sendJsonResponse(res , {
                        status : STATUS_SUCCESS ,
                        response : result
                    } , 200);
                }else {
                    sendJsonResponse(res , {
                        status : STATUS_SUCCESS ,
                        response : `Sorry couldn't find event with search field `
                    } , 200);
                }
            }
        })

    } catch (err) {
        console.log(` error in update event : ${err}`)
        sendJsonResponse(res , {
            status : STATUS_ERROR ,
            errorMessage : `something went wrong ${err}`
        } , 500);
    }
}
