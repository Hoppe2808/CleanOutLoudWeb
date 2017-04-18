var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');

var app = express();

var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : '< MySQL username >',
  password : '< MySQL password >',
  database : '<your database name>'
});

connection.connect();
connection.query('SELECT * from < table name >', function(err, rows, fields) {
  if (!err)
    console.log('The solution is: ', rows);
  else
    console.log('Error while performing Query.');
});

connection.end();

//Get data from database here:
var users = [
	{
		id: 1,
		name: "Sebby",
		pass: "123",
		trash: 9005,
		admin: true
	},
	{
		id: 2,
		name: "Lukas",
		pass: "1234",
		trash: -50,
		admin: false
	},
	{
		id: 3,
		name: "Magnus",
		pass: "12345",
		trash: 400,
		admin: false
	},
	{
		id: 4,
		name: "Rune",
		pass: "123456",
		trash: 900,
		admin: false
	},
	{
		id: 5,
		name: "Nicki",
		pass: "1234567",
		trash: 2,
		admin: false
	}
]
var question = {
	desc: "Hvor grim er Lukas?",
	ans1: "Meget grim",
	ans2: "Rigtig grim",
	ans3: "Ultra grim",
	ans4: "Enormt grim",
	ans5: "Godylt grim"
}

//Setup for various frameworks:

//Viewengine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Bodyparser middelware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Express-validator middelware
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root;

		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg : msg,
			value : value
		};
	}
}));

//Set static path
app.use(express.static(path.join(__dirname, 'public')));

//Global vars
app.use(function(req, res, next){
	res.locals.error = null;
	next();
});

//Control pages:
app.get('/', function(req, res){
	res.render('login', {
		title: 'Log Ind',
		error: ''
	});
});

app.post('/trash', function(req, res){
	res.render('trash', {
		title: "Skralde Menu",
		users: users
	});
});
app.get('/users', function(req, res){
	res.render('users', {
		title: "Bruger Menu",
		error: error
	});
});
app.post('/users', function(req, res){
	res.render('users', {
		title: "Bruger Menu",
		error: ""
	});
});
app.post('/events', function(req, res){
	res.render('events', {
		title: "Events Menu"
	});
});
app.post('/quiz', function(req, res){
	res.render('quiz', {
		title: "Quiz Menu",
		question: question
	});
});
app.get('/quiz', function(req, res){
	res.render('quiz', {
		title: "Quiz Menu",
		question: question,
		error: error
	});
});
app.post('/back', function(req, res){
	res.render('index', {
		title: "Hovedmenu"
	});
});
app.post('/login', function(req, res){
	var uname = req.body.username;
	var pass = req.body.password;
	var bool = false;
	var error = "";
	if(uname === "" && pass === ""){
		error = "Indtast venlisgt et gyligt brugernavn og adgangskode.."
	}else{
		users.forEach(function(user){
			if(user.name.toLowerCase() == uname.toLowerCase()){
				if(user.pass == pass){
					bool = true;
				}else{
					error = "Ugyldig information..";
				}
			}else{
				error = "Ugyldig information..";
			}
		});
	}
	console.log(error);
	if(bool){
		res.render('index', {
			title: "Hovedmenu"
		});		
	}else{
		res.render('login', {
			title: "Log Ind",
			error: error
		});
	}
});
app.post('/logout', function(req, res){
	res.render('login', {
		title: "Log Ind",
		error: ""
	});
});
app.post('/users/create', function(req, res){
	var uname = req.body.username;
	var pass = req.body.password;
	var repass = req.body.repassword;
	var admin = req.body.admin;
	var bool = true;
	if(uname === "" && pass === ""){
		error = "Indtast venlisgt et brugernavn og adgangskode..";
		console.log("No input entered");
	}else{
		users.forEach(function(user){
			if(user.name.toLowerCase() == uname.toLowerCase()){
				error = "Brugernavn findes allerede";
				console.log("User exists");
				bool = false;
			}
		});
		if(pass != repass){
			error = "Adgangskoden stemmer ikke overens.. Prøv igen!";
			console.log("Passwords are not the same");
		}else if (bool){
			var id = users.length;
			var newUser = {
				id: id,
				name: uname,
				pass: pass,
				trash: 0,
				admin: admin

			}
			users.push(newUser);
			error = "Bruger Oprettet..";
			console.log("Success, user created");
		}
	}
	res.redirect('/users');
});
app.post('/quiz/answer',function(req, res){
	var answer = req.body.ans;
	error = "Tak for svaret";
	console.log(answer);
	res.redirect('/quiz');
});

//Listen on serverport:
app.listen(3000, ec2-52-43-233-138.us-west-2.compute.amazonaws.com,function(){
	console.log("Server started on port 3000...")
});
