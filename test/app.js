var express = require("express");
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

/* serves main page */
app.get("/", function(req, res) {
  res.sendfile('./content/index.html')
});

app.get('/fail', function (req, res) {
  throw new Error('Failed');
});

app.post('/data', function (req, res) {
  console.log(req.query);
  console.log(req.params);
  console.log(req.body);
  res.set('Content-Type', 'application/json');
  res.send({ obj : 'yes' });
});

/* serves all the static files */
app.use(express.static(__dirname + '/public'));

var port = 1337;
app.listen(port, function() {
 console.log("Listening on " + port);
});
