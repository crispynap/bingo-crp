var express = require('express');
var app = express();
var router = require('./server/routes/index')(app);

app.set('views', __dirname + '/server/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static('public'));

var server = app.listen(3000, function () {
  console.log("Express server has started on port 3000")
});
