var createError = require('http-errors');
var express = require('express');
const cors = require("cors");
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const compression = require("compression");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../Modal/Response.json');
var indexRouter = require('../routes/index');
var usersRouter = require('../routes/users');
const serverless =require('serverless-http')
var app = express();



app.use(logger('dev'));
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
    exposedHeaders: [],

  })
);


app.use(compression());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use("/", swaggerUi.serve,indexRouter)

app.use('/', swaggerUi.setup(swaggerDocument));
app.use("/", cors({
  "origin": "http://locahost:3000, https://dev.sizecorner.com, https://sizecorner.com/",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}), indexRouter)
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports.handler = serverless(app);
