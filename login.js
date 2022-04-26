var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
require('dotenv').config();

var connection = mysql.createConnection({
	host     : process.env.DB_HOST || 'localhost',
	user     : process.env.DB_USER || 'root',
	password : process.env.DB_PASS || '123',
	database : process.env.DB_NAME || 'projectjs'
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0 && username.length >10) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/test');
			}
			else if (results.length > 0 && username.length<10) {
				request.session.loggedin = true;
				request.session.username = username;
				//response.redirect('/index');
				response.send(`<div align ='center'><h2>login successful</h2></div><br><br><br><div align ='center'><h3>Hello</h3></div><br><br><div align='center'><a href='./login.html'>logout</a></div>`);

			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});
app.get('/test', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back to, ' + request.session.username + '!');
	}
	response.end();
});
app.listen(3000);
