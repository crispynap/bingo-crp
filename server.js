
const express = require('express');
const index = require('./server/routes/index');
const manage = require('./server/routes/manage');
const api = require('./server/routes/api');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport')
const app = express();
const bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', __dirname + '/server/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(session({
  secret: '비밀코드a',
  resave: true,
  saveUninitialized: true
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', api);
app.use('/manage', manage);
app.use('/', index);

const server = app.listen(3000, function () {
  console.log("Express server has started on port 3000")
});