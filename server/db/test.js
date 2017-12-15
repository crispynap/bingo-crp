var mongoose = require('mongoose');
var Book = require('./book');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test', {
  useMongoClient: true
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Connected to mongod server");
});

var book = new Book();
book.title = 'aaa';

rl.on('line', (answer) => {
  if (answer === 'out') {
    Book.find(function (err, books) {
      if (err) {
        console.log('read err' + err);
      }
      console.log(books);
    });
  } else {
    book.author = answer;
    book.save(function (err) {
      if (err) {
        console.log('err' + err);
        return;
      }
    });
  }
  console.log('done');
});