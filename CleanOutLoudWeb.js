var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');

var app = express();

var soap = require('soap');
var url = 'http://ec2-52-43-233-138.us-west-2.compute.amazonaws.com:3769/col?wsdl';

soap.createClient(url, function(err, client){
	client.getWallMessages("", function(err, result){
		var convertUser = JSON.stringify(result.user);
		//var object = JSON.parse(convertUser);
		console.log(convertUser);
	});
});

//Get data from database here:
var token = "";
var error = "";
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
	res.locals.error = "";
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
	if(uname === "" && pass === ""){
		error = "Indtast venligst et gyligt brugernavn og adgangskode..";
		res.render('login', {
			title: "Log Ind",
			error: error
		});
		console.log(error);
	}else{
		var args = {
			arg0: uname,
			arg1: pass
		}
		soap.createClient(url, function(err, client){
			client.login(args, function(err, result){
				error = err;
				token = result.return;
				if(err == null){
					res.render('index', {
						title: "Hovedmenu"
					});	
					error = "";
				}else{
					res.render('login', {
						title: "Log Ind",
						error: error
					});
					console.log(error);
				}
			});
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
	var admin = req.body.ans;
	console.log("HALLor" + admin);
	if(admin == 1){
		admin = "user";
	}else if(admin == 2){
		admin = "manager";
	}else{
		admin = "admin";
	}
	if(uname === "" && pass === ""){
		error = "Indtast venligṣt et brugernavn og adgangskode..";
		console.log("No input entered");
	}else{
		if(pass != repass){
			error = "Adgangskoden stemmer ikke overens.. Prøv igen!";
			console.log("Passwords are not the same");
		}else{
			soap.createClient(url, function(err, client){
				args = {
					arg0: uname,
					arg1: pass,
					arg2: "hulabula",
					arg3: admin,
					arg4: token
				}
				client.createUser(args, function(err, result){
					error = err;
					if(err == null){
						error = "Bruger Oprettet..";
						console.log("Success, user created");
					}else{
						console.log(err);
					}
				});
			});
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
app.listen(3000, function(){
	console.log("Server started on port 3000...");
});