var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');

var app = express();

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
app.post('/users', function(req, res){
	var uname = req.body.username;
	var pass = req.body.password;
	var admin = req.body.admin;
	var bool = false;
	var error = "";
	if(uname === "" && pass === ""){
		error = "Indtast venlisgt et brugernavn og adgangskode.."
	}else{
		users.forEach(function(user){
			if(user.name.toLowerCase() == uname){
				error = "Brugernavn findes allerede";
			}else{
				var id = users.length;
				var newUser = {
					id: id,
					name: uname,
					pass: pass,
					trash: 0,
					admin: admin

				}
				users.push(newUser);
				error = "Bruger Oprettet.."
			}
		});
	}
	res.render('users', {
		title: "Bruger Menu",
		error: error
	});
})
app.post('/quiz/answer',function(req, res){
	var answer = req.body.ans;
	console.log(answer);
		res.render('quiz', {
		title: "Quiz Menu",
		question: question
	});
})

//Listen on serverport:
app.listen(3000, 'ec2-52-43-233-138.us-west-2.compute.amazonaws.com' ,function(){
	console.log("Server started on port 3000...")
});
