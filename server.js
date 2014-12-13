var http = require('http');
var express = require('express');
var ns = require('express-namespace');
var bodyParser = require('body-parser')

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use("/",express.static(__dirname + '/resources'));

var server = app.listen(process.env.PORT || 8080);
console.log("Initialized server on port ",8080);

var api = require('./api/gpio-api')(app, {

});