
const express = require('express');
const index = require('./server/routes/index');
const manage = require('./server/routes/manage');
const api = require('./server/routes/api');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', __dirname + '/server/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test', {
  useMongoClient: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Connected to mongod server");
});

app.use('/api', api);
app.use('/manage', manage);
app.use('/', index);

const server = app.listen(3000, function () {
  console.log("Express server has started on port 3000")
})
