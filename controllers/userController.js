const Joi = require('joi');
const pool = require('../config/db_config');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {sendJsonResponse , excuteQuery } = require('../utils/common_utils')
const {createPool} = require("mysql");
module.exports.register = (req,res) => {
    try {
        const schema = Joi.object({
            name: Joi.string().min(3).max(100).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(8).max(100).required()
        });
        let { error , value } = schema.validate(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        } else {
            let checkSql = `SELECT email FROM users WHERE email = '${value.email}'`
            pool.query(checkSql , (error , checkResult) => {
                    if (error) {
                        sendJsonResponse(res , {
                            status : 'error' ,
                            erroMessage : error.message
                        } , 200)
                    }
                  if (checkResult.length > 0) {
                      sendJsonResponse(res , {
                          status : 'error' ,
                          errorMessage : `email ${value.email} already registered`
                      } , 200);
                  } else {
                      let inserQuery = ` INSERT INTO users(name , email , password , created_at) VALUES(?,?,?,?)`
                      bcrypt.hash(value.password , 10  ,  (err , hash) => {
                          let parameters = [value.name , value.email , hash , Date.now()]
                            pool.query(inserQuery , parameters , (err , result ) => {
                              if (err ) {
                                  sendJsonResponse(res , {
                                      status : false ,
                                      errorMessage : err.message
                                  } , 400)
                              }else {
                                  sendJsonResponse(res , {
                                      status : true ,
                                      successMessage : 'saved successfully'
                                  } , 200);
                              }
                          })
                      })
                  }
            })
        }
    }catch (err) {
        console.log(err);
        sendJsonResponse(res , {
            status : 'error' ,
            errorMessage : 'Something went wrong !'
        } , 500);
    }
}

module.exports.signIn = (req,res) => {
    try {
        let {email , password} = req.body;
        let checkEmail =  `select id ,  email , name ,  password from users where email = '${email}'`
        pool.query(checkEmail , (err , result ) => {
            if (err) console.log('err');
            if (result.length > 0) {
            bcrypt.compare(password , result[0].password , (err , isMatch) => {
                if (isMatch) {
                    let userInfo = {
                        id : result[0].id ,
                        name : result[0].name ,
                        email : result[0].email
                    }
                    let token = jwt.sign(userInfo , process.env.JWT_SECRET , {expiresIn: '15m'})
                    sendJsonResponse(res ,{
                        status : 'success' ,
                        token , userInfo
                    } , 200);
                }else {
                    sendJsonResponse(res , {
                        status : 'error' ,
                        errorMessage : 'Invalid Credentials email or password'
                    }, 200);
                }
            }) }else {
                sendJsonResponse(res , {
                    status : 'error' ,
                    errorMessage : `email ${email} is not registered`
                } , 200);
            }
        })
    }catch (err) {
        console.log('error in signIn function : ' ,err);
        sendJsonResponse(res , {
            status  : 'error' ,
            errorMessage : 'Something went wrong !'
        } , 500);
    }
}
