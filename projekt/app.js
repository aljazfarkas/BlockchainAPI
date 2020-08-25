var express = require('express');
var path = require('path');
var http = require('http');

var app = express();
var server = http.createServer(app);

var bodyParser = require('body-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

/**
 * Get port from environment and store in Express.
 */
//if there is no third argument, we randomize port from 3001-3010
var port;
if(process.argv.length < 3){ 
    port = 3001+Math.floor(Math.random()*9)
}
else{
    //get port from command line
    port = process.argv[2];
}
var port = normalizePort(process.env.PORT || port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//we listen
server.listen(port, () => console.info(`Express server running on port ${port}...`));


function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}