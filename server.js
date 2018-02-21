
const express = require('express');
const index = require('./server/routes/index');
const manage = require('./server/routes/manage');
const api = require('./server/routes/api');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', __dirname + '/server/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use('/api', api);
app.use('/manage', manage);
app.use('/', index);

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Bingo0221!',
  database: 'crp'
});
connection.connect();

const server = app.listen(3000, function () {
  console.log("Express server has started on port 3000  hahaha")
})

