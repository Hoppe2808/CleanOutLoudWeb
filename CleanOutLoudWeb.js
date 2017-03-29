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
		trash: 9005
	},
	{
		id: 2,
		name: "Luka",
		trash: -50
	},
	{
		id: 3,
		name: "Magnus",
		trash: 400
	},
	{
		id: 4,
		name: "Rune",
		trash: 900
	},
	{
		id: 5,
		name: "Nicki",
		trash: 2
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
		title: 'Log Ind'
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
		title: "Bruger Menu"
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
	res.render('index', {
		title: "Hovedmenu"
	});
});
app.post('/logout', function(req, res){
	res.render('login', {
		title: "Log Ind"
	});
});

//Listen on serverport:
app.listen(3000, function(){
	console.log("Server started on port 3000...")
});