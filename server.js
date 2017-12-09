var express = require('express');

// var routes = require('./server/routes/index');
// var users = require('./server/routes/users');

var app = express();

app.set('views', __dirname + 'server/views/pages');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// app.use('/', routes);
// app.use('/users', users);

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.send('Hello World');
});

var server = app.listen(3000, function () {
  console.log("Express server has started on port 3000")
})