
const express = require('express');

const routes = require('./server/routes/index');
// const users = require('./server/routes/users');

const app = express();

app.set('views', __dirname + '/server/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use('/', routes);
// app.use('/users', users);

app.use(express.static('public'));

const server = app.listen(3000, function () {
  console.log("Express server has started on port 3000")
})