var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var $ = require('jquery');
var session = require('express-session');

var app = express();

var soap = require('soap');
var url = 'http://ec2-52-43-233-138.us-west-2.compute.amazonaws.com:3769/col?wsdl';

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

app.use(session({
	secret: 'ssshhhhh',
	resave: true,
	saveUninitialized: true,
	cookie: {
		maxAge: 68000
	}}
	));

//Global vars
app.use(function(req, res, next){
	res.locals.error = "";
	next();
});
var sess;

//Control pages:
app.get('/', function(req, res){
	sess = req.session; 
	if(sess.token) {
		res.redirect('/index');
	}else{
		res.render('login', {
			title: 'Log Ind',
			error: ''
		});
	}
});
app.post('/backLogin', function(req, res){
	res.render('login', {
		title: 'Log Ind',
		error: ''
	});
});
app.get('/backLogin', function(req, res){
	res.render('login', {
		title: 'Log Ind',
		error: ''
	});
});
app.get('/index', function(req, res){
	sess = req.session;
	if(sess.token){
		res.render('index', {
			title: 'Hovedmenu',
			permission: sess.user.userType
		});
	}else{
		res.render('login', {
			title: 'Log Ind',
			error: 'Session udløbet'
		});
	}
});
app.post('/wall', function(req, res){
	sess = req.session;
	if(sess.token){
		sess.error = "";
		soap.createClient(url, function(err, client){
			client.getWallMessages("", function(err, result){
				sess.error = err;
				var json = result;
				for (var i = 0; i < json.return.length; i++) {
					sess.messageID[i] = json.return[i].messageId;
					sess.messages[i] = json.return[i].text;
					sess.dates[i] = json.return[i].date;
				}
				console.log("Wall messages recieved...");
				res.render('wall', {
					title: "Væg",
					messageID: sess.messageID,
					messages: sess.messages,
					dates: sess.dates,
					error: sess.error
				});	
			});
		});
	}else{
		res.render('login', {
			title: 'Log Ind',
			error: 'Session udløbet'
		});
	}
});
app.get('/wall', function(req, res){
	sess = req.session;
	if(sess.token){
		sess.error = "";
		soap.createClient(url, function(err, client){
			client.getWallMessages("", function(err, result){
				sess.error = err;
				var json = result;
				for (var i = 0; i < json.return.length; i++) {
					sess.messageID[i] = json.return[i].messageId;
					sess.messages[i] = json.return[i].text;
					sess.dates[i] = json.return[i].date;
				}
				console.log("Wall messages recieved...");
				res.render('wall', {
					title: "Væg",
					messageID: sess.messageID,
					messages: sess.messages,
					dates: sess.dates,
					error: sess.error
				});	
			});
		});
	}else{
		res.render('login', {
			title: 'Log Ind',
			error: 'Session udløbet'
		});
	}
});
app.post('/writeMessage', function(req, res){
	res.render('writeMessage', {
		title: "Opret Ny Besked"
	});
});
app.post('/writeMessage/submit', function(req, res){
	sess = req.session;
	if(sess.token){
		var message = req.body.message;
		var args = {
			arg0: message,
			arg1: sess.token
		}
		soap.createClient(url, function(err, client){
			client.addMessage(args, function(err, result){
				sess.error = err;
				console.log(err);
				if(err == null){
					res.redirect('/wall');	
				}
			});
		});
	}else{
		res.render('login', {
			title: 'Log Ind',
			error: 'Session udløbet'
		});
	}
});
app.post('/trash', function(req, res){
	sess = req.session;
	if(sess.token){
		soap.createClient(url, function(err, client){
			client.getCampsSortedInWeight("", function(err, result){
				sess.error = err;
				if(sess.error = null){
					console.log("Camps recieved...");
				}
				var json = result;
				for (var i = 0; i < json.return.length; i++) {
					sess.camps[i] = json.return[i].campName;
					sess.weight[i] = json.return[i].garbageWeight;
				}
				res.render('trash', {
					title: "Skralde Menu",
					camps: sess.camps,
					weight: sess.weight,
					permission: sess.user.userType,
					error: sess.error
				});
			});
		});
	}else{
		res.render('login', {
			title: 'Log Ind',
			error: 'Session udløbet'
		});
	}
});
app.get('/trash', function(req, res){
	sess = req.session;
	if(sess.token){
		res.render('trash', {
			title: "Skralde Menu",
			camps: sess.camps,
			weight: sess.weight,
			permission: sess.user.userType,
			error: sess.error
		});
	}else{
		res.render('login', {
			title: 'Log Ind',
			error: 'Session udløbet'
		});
	}
});
app.post('/trash/add', function(req, res){
	sess = req.session;
	if(sess.token){
		var camp = req.body.selectpicker;
		var weightAdded = req.body.weight;
		args = {
			arg0: camp,
			arg1: weightAdded,
			arg2: sess.token
		}
		soap.createClient(url, function(err, client){
			client.setGarbage(args, function(err, result){
				sess.error = err;
				if(sess.error == null){
					sess.error = "Kilo ændret..";
				}
				console.log(sess.error);
				client.getCampsSortedInWeight("", function(err, result){
					sess.error = err;
					if(sess.error = null){
						console.log("Camps recieved...");
					}
					var json = result;
					for (var i = 0; i < json.return.length; i++) {
						sess.camps[i] = json.return[i].campName;
						sess.weight[i] = json.return[i].garbageWeight;
					}
					res.redirect("/trash");
				});
			});
		});
	}else{
		res.render('login', {
			title: 'Log Ind',
			error: 'Session udløbet'
		});
	}
});
app.get('/users', function(req, res){
	sess = req.session;
	soap.createClient(url, function(err, client){
		client.getCamps("", function(err, result){
			if(err != null){
				sess.error = err;
			}
			var json = result.return;
			var camps = [];
			for (var i = 0; i < json.length; i++) {
				camps[i] = json[i].campName;
			}
			if (sess.token){
				res.render('users', {
					title: "Bruger Menu",
					token: sess.token,
					camps: camps,
					error: JSON.stringify(sess.error.root.Envelope.Body.Fault.faultstring)
				});
			}else{
				res.render('users', {
					title: "Bruger Menu",
					token: "",
					camps: camps,
					error: JSON.stringify(sess.error.root.Envelope.Body.Fault.faultstring)
				});
			}
		});
	});	
});
app.post('/users', function(req, res){
	sess = req.session;
	soap.createClient(url, function(err, client){
		client.getCamps("", function(err, result){
			if(err != null){
				sess.error = err;
			}
			var json = result.return;
			var camps = [];
			for (var i = 0; i < json.length; i++) {
				camps[i] = json[i].campName;
			}
			if (sess.token){
				res.render('users', {
					title: "Bruger Menu",
					token: sess.token,
					camps: camps,
					error: JSON.stringify(sess.error.root.Envelope.Body.Fault.faultstring)
				});
			}else{
				res.render('users', {
					title: "Bruger Menu",
					token: "",
					camps: camps,
					error: JSON.stringify(sess.error.root.Envelope.Body.Fault.faultstring)
				});
			}
		});
	});	
});
app.post('/camp', function(req, res){
	sess = req.session;
	if(sess.token){
		soap.createClient(url, function(err, client){
			client.getCamps("", function(err, result){
				sess.error = err;
				var json = result.return;
				for (var i = 0; i < json.length; i++) {
					sess.camps[i] = json[i].campName;
				}
				res.render('camps', {
					title: "Camp Menu",
					camps: sess.camps,
					error: sess.error
				});
			});
		});	
	}else{
		res.render('login', {
			title: 'Log Ind',
			error: 'Session udløbet'
		});
	}
});
app.get('/camp', function(req, res){
	sess = req.session;
	if(sess.token){
		soap.createClient(url, function(err, client){
			client.getCamps("", function(err, result){
				sess.error = err;
				var json = result.return;
				for (var i = 0; i < json.length; i++) {
					sess.camps[i] = json[i].campName;
				}
				res.render('camps', {
					title: "Camp Menu",
					camps: sess.camps,
					error: sess.error
				});
			});
		});	
	}else{
		res.render('login', {
			title: 'Log Ind',
			error: 'Session udløbet'
		});
	}
});
app.post('/back', function(req, res){
	sess = req.session;
	if(sess.token){
		res.render('index', {
			title: "Hovedmenu",
			permission: sess.user.userType
		});
	}else{
		res.render('login', {
			title: 'Log Ind',
			error: 'Session udløbet'
		});
	}
});
app.get('/back', function(req, res){
	sess = req.session;
	if(sess.token){
		res.render('index', {
			title: "Hovedmenu",
			permission: sess.user.userType
		});
	}else{
		res.render('login', {
			title: 'Log Ind',
			error: 'Session udløbet'
		});
	}
});
app.post('/createCamp', function(req, res){
	sess = req.session;
	if(sess.token){
		var name = req.body.name;
		var args = {
			arg0: name,
			arg1: sess.token
		}
		soap.createClient(url, function(err, client){
			client.addCamp(args, function(err, result){
				sess.error = err;
				if(sess.error == null){
					console.log("New camp created...");
					sess.error = "Du har oprettet en camp";
				}
				res.redirect('/camp');
			});
		});
	}else{
		res.render('login', {
			title: 'Log Ind',
			error: 'Session udløbet'
		});
	}
});
app.post('/users/create', function(req, res){
	sess = req.session;
	var uname = req.body.username;
	var pass = req.body.password;
	var repass = req.body.repassword;
	var camp = req.body.selectpicker;
	var admin = req.body.ans;
	var token;
	var error;
	if(sess){
		token = sess.token;
	}else{
		token = "";
	}
	if(admin == 1 || admin == null){
		admin = "user";
	}else if(admin == 2){
		admin = "admin";
	}
	if(uname === "" && pass === ""){
		sess.error = "Indtast venligṣt et brugernavn og adgangskode..";
		console.log("No input entered");
	}else{
		if(pass != repass){
			sess.error = "Adgangskoden stemmer ikke overens.. Prøv igen!";
			console.log("Passwords are not the same");
		}else{
			soap.createClient(url, function(err, client){
				args = {
					arg0: uname,
					arg1: pass,
					arg2: camp,
					arg3: admin,
					arg4: token
				}
				client.createUser(args, function(err, result){
					sess.error = err;
					if(err == null){
						sess.error = "Bruger Oprettet";
						console.log("Success, user created...");
					}else{
						console.log(sess.error);
					}
					res.redirect('/users');
				});
			});
		}
	}
});
app.post('/comments',function(req, res){
	sess = req.session;
	soap.createClient(url, function(err, client){
		sess.comments = [];
		sess.singleID = req.body.message;
		args = {
			arg0: sess.singleID
		}
		client.getCommentsForMessage(args, function(err, result){
			sess.error = err;
			if(result != null){
				var json = result.return;
				for (var i = 0; i < json.length; i++) {
					sess.comments[i] = json[i].text;
				}
				console.log("Comments for message recieved...");
			}
		});
	});	
});
app.get('/singleMessage.ejs', function(req, res){
	setTimeout(function(){
		sess = req.session;	
	}, 2000);
	if(sess.token){
		soap.createClient(url, function(err, client){
			args = {
				arg0: sess.singleID
			}
			if(sess.comments.length >= 1){
				if(sess.comments[0].messageId != sess.singleID){
					sess.comments = [];
				}
			}
			client.getMessage(args, function(err, result){
				if(err == null){
					var message = result.return.text;
					res.render('singleMessage', {
						title: "Kommentarer",
						message: message,
						comments: sess.comments,
						error: sess.error
					});
				}else{
					console.log(err);
					res.render('singleMessage', {
						title: "Kommentarer",
						message: req.body.header,
						comments: sess.comments,
						error: err
					});
				}
			});
		});
	}else{
		res.render('login', {
			title: 'Log Ind',
			error: 'Session udløbet'
		});
	}
});
app.post('/login', function(req, res){
	var uname = req.body.username;
	var pass = req.body.password;
	var bool = false;
	if(uname === "" && pass === ""){
		var tempError = "Indtast venligst et gyligt brugernavn og adgangskode..";
		res.render('login', {
			title: "Log Ind",
			error: tempError
		});
		console.log(tempError);
	}else{
		var args = {
			arg0: uname,
			arg1: pass
		}
		soap.createClient(url, function(err, client){
			client.login(args, function(err, result){

				//Create new session
				sess = req.session;

				//sess.name = result.return;
				sess.messages = [];
				sess.messageID = [];
				sess.dates = [];
				sess.user = {};
				sess.users = [];
				sess.camps = [];
				sess.weight = [];
				sess.comments = [];
				sess.singleID = 0;

				sess.error = err;
				sess.token = result.return;
				args.arg1 = sess.token;
				if(err == null){
					client.getUser(args, function(err, result){
						sess.error = err;
						if(sess.error == null){
							sess.user = result.return;	
						}
						var type = "";
						if(sess.user == null){
							type = "admin";
						}else{
							type = sess.user.userType;
						}

						res.render('index', {
							title: "Hovedmenu",
							permission: type
						});	
						console.log("User %s logged in...", sess.user.userName);
					});
					sess.error = "";
				}else{
					res.render('login', {
						title: "Log Ind",
						error: sess.error
					});
					console.log(sess.error);
				}
			});
		});
	}
});
app.post('/logout', function(req, res){
	sess = req.session;
	sess.destroy(function(err){
		sess = null;
		if (err != null){
			console.log(err);
		}else{
			res.render('login', {
				title: "Log Ind",
				error: ""
			});
		}
	});
});
//Listen on serverport:
app.listen(3000, function(){
	console.log("Server started on port 3000...");
});