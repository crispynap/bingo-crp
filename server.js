
const express = require('express');
const index = require('./server/routes/index');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require("fs");

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: '@#@$Whdsuifh#@$#$',
  resave: false,
  saveUninitialized: true
}));

app.set('views', __dirname + '/server/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use('/', index);

const server = app.listen(3000, function () {
  console.log("Express server has started on port 3000")
})
