const pool = require('../config/db_config')
const {sendJsonResponse} = require("../utils/common_utils");
const Joi = require("joi");
const STATUS_SUCCESS = true
const STATUS_ERROR = false
module.exports.add = (req,res) => {
    try {
        const schema = Joi.object({
            name: Joi.string().min(3).max(100).required(),
            email: Joi.string().email().required(),
            userId: Joi.number().required()
        });
        let { error , value } = schema.validate(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }else {
            let insertQuery = `INSERT INTO company(name , email , user_id) VALUES(?,?,?);`

            let parameters = [value.name , value.email , value.userId];
            pool.query(insertQuery , parameters , (err , result ) => {
                if (err) {
                    sendJsonResponse(res , {
                        status : STATUS_ERROR ,
                        errorMessage : `Company with  email ${value.email} Already added!!`
                    } , 200);
                }else {
                    sendJsonResponse(res , {
                        status : STATUS_SUCCESS ,
                        successMessage : 'saved successfully'
                    }, 200);
                }

            })
        }
    }catch (err) {
        console.log('err');
        sendJsonResponse(res , {
            status : STATUS_ERROR ,
            errorMessage : `something went wrong!`
        } , 500);
    }
}

module.exports.createProfile = (req,res) => {
    try {
        const schema = Joi.object({
            description: Joi.string().min(3).max(100).required(),
            location: Joi.string().required(),
            logo: Joi.string().required(),
            companyId: Joi.number().required()
        });
        let { error , value } = schema.validate(req.body);
        if (error) {
            sendJsonResponse(res , {
                status : STATUS_ERROR ,
                errorMessage : error.details[0].message
            } , 400);
        }else {
            let insertQuery = `INSERT INTO company_profile(description , location , logo , company_id) VALUES(?,?,?,?);`

            let parameters = [value.description , value.location , value.logo , value.companyId];
            pool.query(insertQuery , parameters , (err , result ) => {
                if (err) {
                    console.log(err);
                    sendJsonResponse(res , {
                        status : STATUS_ERROR ,
                        errorMessage : `something went wrong !!`
                    } , 500);
                }else {
                    sendJsonResponse(res , {
                        status : STATUS_SUCCESS ,
                        successMessage : 'saved successfully'
                    }, 200);
                }
            })
        }
    }catch (err) {
        console.log('err');
        sendJsonResponse(res , {
            status : STATUS_ERROR ,
            errorMessage : `something went wrong!`
        } , 500);
    }
}
module.exports.updateProfile = (req,res) => {
    try {
        const schema = Joi.object({
            description: Joi.string().min(3).max(100).required(),
            location: Joi.string().required(),
            logo: Joi.string().required(),
            companyId: Joi.number().required()
        });
        let { error , value } = schema.validate(req.body);
        if (error) {
            sendJsonResponse(res , {
                status : STATUS_ERROR ,
                errorMessage : error.details[0].message
            } , 400);
        }else {
            let insertQuery = `UPDATE company_profile set description = ?  , location = ?  , logo = ?  where company_id = ? ;`

            let parameters = [value.description , value.location , value.logo , value.companyId];
            pool.query(insertQuery , parameters , (err , result ) => {
                if (err) {
                    console.log(err);
                    sendJsonResponse(res , {
                        status : STATUS_ERROR ,
                        errorMessage : `something went wrong !!`
                    } , 500);
                }else {
                    sendJsonResponse(res , {
                        status : STATUS_SUCCESS ,
                        successMessage : 'updated successfully'
                    }, 200);
                }
            })
        }
    }catch (err) {
        console.log('err');
        sendJsonResponse(res , {
            status : STATUS_ERROR ,
            errorMessage : `something went wrong!`
        } , 500);
    }
}
module.exports.followCompany = (req,res) => {
    try {
        console.log('follow body : ' , req.body)
        const schema = Joi.object({
            userId: Joi.number().min(1).max(100).required(),
            companyId: Joi.number().required(),
        });
        let { error , value } = schema.validate(req.body);
        if (error) {
            sendJsonResponse(res , {
                status : STATUS_ERROR ,
                errorMessage : error.details[0].message
            } , 400);
        }else {
            let insertQuery = `INSERT INTO follow(user_id , company_id) VALUES(?,?);`

            let parameters = [value.userId , value.companyId];
            pool.query(insertQuery , parameters , (err , result ) => {
                if (err) {
                    sendJsonResponse(res , {
                        status : STATUS_ERROR ,
                        errorMessage : `Already following !`
                    } , 200);
                }else {
                    sendJsonResponse(res , {
                        status : STATUS_SUCCESS ,
                        successMessage : 'Followed successfully'
                    }, 200);
                }
            })
        }
    }catch (err) {
        console.log('err');
        sendJsonResponse(res , {
            status : STATUS_ERROR ,
            errorMessage : `something went wrong!`
        } , 500);
    }
}

module.exports.fetchFollowingUsers = (req,res) => {
    try {
        const schema = Joi.object({
            companyId: Joi.number().required(),
        });
        let { error , value } = schema.validate(req.params);
        if (error) {
            sendJsonResponse(res , {
                status : STATUS_ERROR ,
                errorMessage : error.details[0].message
            } , 400);
        }else {
            let fetchQuery = `SELECT U.name as username FROM follow F INNER JOIN users U ON U.id = F.user_id WHERE F.company_id = ${value.companyId};`
            pool.query(fetchQuery , (err , result ) => {
                if (err) {
                    console.log(err);
                    sendJsonResponse(res , {
                        status : STATUS_ERROR ,
                        errorMessage : `something went wrong!`
                    } , 500);
                }else {
                    sendJsonResponse(res , {
                        status : STATUS_SUCCESS ,
                        response : result
                    }, 200);
                }
            })
        }
    }catch (err) {
        console.log('err');
        sendJsonResponse(res , {
            status : STATUS_ERROR ,
            errorMessage : `something went wrong!`
        } , 500);
    }
}
module.exports.fetchAllCompanies = (req,res) => {
    try {
            let {userId , companyId} = req.query;
            let fetchQuery = `SELECT U.name as companyOwner , C.name as companyName , CP.description , CP.location , CP.logo ,  C.id as companyId FROM company C
                                INNER JOIN users U ON U.id = C.user_id
                                LEFT JOIN company_profile CP ON CP.company_id = C.id `
            if (userId) {
                fetchQuery += ` WHERE U.id = ${userId} `
            }
            if (companyId) {
                fetchQuery += ` WHERE C.id = ${companyId} `
            }
        pool.query(fetchQuery , (err , result ) => {
                if (err) {
                    console.log(err);
                    sendJsonResponse(res , {
                        status : STATUS_ERROR ,
                        errorMessage : `something went wrong!`
                    } , 500);
                }else {
                    sendJsonResponse(res , {
                        status : STATUS_SUCCESS ,
                        response : result
                    }, 200);
                }
            })

    }catch (err) {
        console.log('err');
        sendJsonResponse(res , {
            status : STATUS_ERROR ,
            errorMessage : `something went wrong!`
        } , 500);
    }
}
module.exports.fetchCompanyEvents = (req,res) => {
    try {
        const schema = Joi.object({
            companyId: Joi.number().required(),
        });
        let { error , value } = schema.validate(req.params);
        if (error) {
            sendJsonResponse(res , {
                status : STATUS_ERROR ,
                errorMessage : error.details[0].message
            } , 400);
        }else {
            let fetchQuery = `SELECT CE.name , CE.description , CE.start_date as startDate , CE.end_date as endDate , CE.id as eventId , C.name as companyName  FROM company_events CE inner join company C on C.id = CE.company_id  WHERE CE.company_id = ${value.companyId};`
            pool.query(fetchQuery , (err , result ) => {
                if (err) {
                    console.log(err);
                    sendJsonResponse(res , {
                        status : STATUS_ERROR ,
                        errorMessage : `something went wrong!`
                    } , 500);
                }else {
                    if (result) {
                        sendJsonResponse(res , {
                            status : STATUS_SUCCESS ,
                            response : result
                        }, 200);
                    }
                }
            })
        }
    }catch (err) {
        console.log(`Error in fetching company event: ${err}`);
        sendJsonResponse(res , {
            status : STATUS_ERROR ,
            errorMessage : `something went wrong!`
        } , 500);
    }
}
module.exports.fetchCompanyEventsBookings = (req,res) => {
    try {
        const schema = Joi.object({
            companyId: Joi.number().required(),
        });
        let { error , value } = schema.validate(req.params);
        if (error) {
            sendJsonResponse(res , {
                status : STATUS_ERROR ,
                errorMessage : error.details[0].message
            } , 400);
        }else {
            let fetchQuery = `SELECT CE.name , U.name as personName,  CE.id as eventId , U.id as userId FROM company_events CE 
                              inner join company C on C.id = CE.company_id 
                              inner join event_bookings EB on EB.event_id = CE.id
                              INNER JOIN users U on U.id = EB.user_id
                              WHERE CE.company_id = ${value.companyId};`
            pool.query(fetchQuery , (err , result ) => {
                if (err) {
                    console.log(err);
                    sendJsonResponse(res , {
                        status : STATUS_ERROR ,
                        errorMessage : `something went wrong!`
                    } , 500);
                }else {
                    if (result) {
                        sendJsonResponse(res , {
                            status : STATUS_SUCCESS ,
                            response : result
                        }, 200);
                    }
                }
            })
        }
    }catch (err) {
        console.log(`Error in fetching company event: ${err}`);
        sendJsonResponse(res , {
            status : STATUS_ERROR ,
            errorMessage : `something went wrong!`
        } , 500);
    }
}
module.exports.fetchCompanyEventsBookingsStatus = (req,res) => {
    try {
        const schema = Joi.object({
            type: Joi.number().required(),
            userId: Joi.number().required(),
            eventId: Joi.number().required()
        });
        let { error , value } = schema.validate(req.body);
        if (error) {
            sendJsonResponse(res , {
                status : STATUS_ERROR ,
                errorMessage : error.details[0].message
            } , 400);
        }else {
            let fetchQuery = `UPDATE event_bookings set status = ?
                              WHERE event_id = ? AND user_id = ?`
            let values = [];
            if (value.type == 1) {
                values.push('accepted')
            }else {
                values.push('rejected')
            }

            values.push(value.eventId)
            values.push(value.userId)

            pool.query(fetchQuery , values , (err , result ) => {
                if (err) {
                    console.log(err);
                    sendJsonResponse(res , {
                        status : STATUS_ERROR ,
                        errorMessage : `something went wrong!`
                    } , 500);
                }else {
                    if (result) {
                        sendJsonResponse(res , {
                            status : STATUS_SUCCESS ,
                            response : values[0] + ' successfully '
                        }, 200);
                    }
                }
            })
        }
    }catch (err) {
        console.log(`Error in fetching company event: ${err}`);
        sendJsonResponse(res , {
            status : STATUS_ERROR ,
            errorMessage : `something went wrong!`
        } , 500);
    }
}
