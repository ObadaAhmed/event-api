require('dotenv').config()
const express = require('express');
const path = require('path');
const http = require('http')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const rjwt = require('restify-jwt-community');
const socket = require('socket.io');
const debug = require('debug')('application');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const companiesRouter = require('./routes/company');
const eventsRouter = require('./routes/events');
const helmet = require("helmet");
const port  = process.env.PORT || 5000;
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(cors())
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(rjwt({secret : process.env.JWT_SECRET }).unless({path : ['/api/users/auth' , '/api/users/register']}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/events', eventsRouter);


const server = app.listen(port , () => console.log(`app running on port ${port}`))

const io = socket(server)

io.on("connection" , (socket) => {
    console.log("socket connected")
    socket.on("disconnect" , () => {
        console.log("socket disconnected");
    })
    socket.on("sendNotification" , (data) => {
        io.emit("new-notification" , data)
    })
})

module.exports = app;
