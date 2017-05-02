var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');

var app = express();

var soap = require('soap');
var url = 'http://ec2-52-43-233-138.us-west-2.compute.amazonaws.com:3769/col?wsdl';

//Get data from database here:
var token = "";
var error = "";
var messages = [];
var dates = [];
var user = {};
var users = [];
var camps = [];
var weight = [];

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
app.get('/index', function(req, res){
	res.render('index', {
		title: 'Hovedmenu',
		permission: user.userType
	});
});
app.post('/wall', function(req, res){
	error = "";
	res.render('wall', {
		title: "Væg",
		messages: messages,
		dates: dates,
		error: error
	});	
});
app.post('/writeMessage', function(req, res){
	res.render('writeMessage', {
		title: "Opret Ny Besked"
	});
});
app.post('/writeMessage/submit', function(req, res){
	var message = req.body.message;
	var args = {
		arg0: message,
		arg1: token
	}
	soap.createClient(url, function(err, client){
		client.addMessage(args, function(err, result){
			error = err;
			console.log(err);
			if(err == null){
				getMessages(res);
				res.redirect('/index');	
			}
		});
	});
});
app.post('/trash', function(req, res){
	soap.createClient(url, function(err, client){
		client.getCampsSortedInWeight("", function(err, result){
			error = err;
			if(error = null){
				console.log("Camps recieved...");
			}
			var json = result;
			for (var i = 0; i < json.return.length; i++) {
				camps[i] = json.return[i].campName;
				weight[i] = json.return[i].garbageWeight;
			}
			res.render('trash', {
				title: "Skralde Menu",
				camps: camps,
				weight: weight,
				permission: user.userType,
				error: error
			});
		});
	});
});
app.get('/trash', function(req, res){
	res.render('trash', {
		title: "Skralde Menu",
		camps: camps,
		weight: weight,
		permission: user.userType,
		error: error
	});
});
app.post('/trash/add', function(req, res){
	var camp = req.body.selectpicker;
	var weightAdded = req.body.weight;
	args = {
		arg0: camp,
		arg1: weightAdded,
		arg2: token
	}
	soap.createClient(url, function(err, client){
		client.setGarbage(args, function(err, result){
			error = err;
			if(error == null){
				error = "Kilo ændret..";
			}
			console.log(error);
				client.getCampsSortedInWeight("", function(err, result){
					error = err;
					if(error = null){
						console.log("Camps recieved...");
					}
					var json = result;
					for (var i = 0; i < json.return.length; i++) {
						camps[i] = json.return[i].campName;
						weight[i] = json.return[i].garbageWeight;
					}
					res.redirect("/trash");
				});
		});
	});
});
app.get('/users', function(req, res){
	res.render('users', {
		title: "Bruger Menu",
		users: users,
		token: token,
		error: error
	});
});
app.post('/users', function(req, res){
	res.render('users', {
		title: "Bruger Menu",
		users: users,
		token: token,
		error: ""
	});
});
app.post('/deleteUser', function(req, res){
	soap.createClient(url, function(err, client){
		client.getCamps("", function(err, result){
			res.redirect("/users");
		});
	});
});
app.post('/camp', function(req, res){
	soap.createClient(url, function(err, client){
		client.getCamps("", function(err, result){
			error = err;
			var json = result.return;
			for (var i = 0; i < json.length; i++) {
				camps[i] = json[i].campName;
			}
			res.render('camps', {
				title: "Camp Menu",
				camps: camps,
				error: ""
			});
		});
	});	
});
app.get('/camp', function(req, res){
	res.render('camps', {
		title: "Camp Menu",
		camps: camps,
		error: error
	});
});
app.post('/events', function(req, res){
	res.render('events', {
		title: "Events Menu"
	});
});
app.post('/back', function(req, res){
	res.render('index', {
		title: "Hovedmenu",
		permission: user.userType
	});
});
app.post('/deleteCamp', function(req, res){
	var name = req.body.selectpicker;
	args = {
		arg0: name,
		arg1: token
	}
	soap.createClient(url, function(err, client){
		client.deleteCamp(args, function(err, result){

			res.redirect('/camp');
		});
	});
});
app.post('/createCamp', function(req, res){
	var name = req.body.name;
	var args = {
		arg0: name,
		arg1: token
	}
	soap.createClient(url, function(err, client){
		client.addCamp(args, function(err, result){
			error = err;
			if(error == null){
				console.log("New camp created...");
				error = "Du har oprettet en camp";
			}
			res.redirect('/camp');
		});
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
				args.arg1 = token;
				if(err == null){
					getMessages(res);
					client.getUser(args, function(err, result){
						user = result.return;
						res.render('index', {
							title: "Hovedmenu",
							permission: user.userType
						});	
						console.log("User %s logged in...", user.userName);
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
	if(admin == 1 || admin == null){
		admin = "user";
	}else if(admin == 2){
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
	if(token == "null"){
		res.redirect('/login');
	}else{
		res.redirect('/users');
	}
});
app.post('/quiz/answer',function(req, res){
	var answer = req.body.ans;
	error = "Tak for svaret";
	console.log(answer);
	res.redirect('/quiz');
});
function getMessages(res){
	soap.createClient(url, function(err, client){
		client.getWallMessages("", function(err, result){
			error = err;
			var json = result;
			for (var i = 0; i < json.return.length; i++) {
				messages[i] = json.return[i].text;
				dates[i] = json.return[i].date;
			}
			console.log("Wall messages recieved...");
		});
	});
}
function updateCamps(){
	soap.createClient(url, function(err, client){
		client.getCampsSortedInWeight("", function(err, result){
			error = err;
			if(error = null){
				console.log("Camps recieved...");
			}
			var json = result;
			for (var i = 0; i < json.return.length; i++) {
				camps[i] = json.return[i].campName;
				weight[i] = json.return[i].garbageWeight;
			}
		});
	});
}
//Listen on serverport:
app.listen(3000, function(){
	console.log("Server started on port 3000...");
});