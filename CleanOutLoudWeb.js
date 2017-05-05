var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var $ = require('jquery');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

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

//Session setup
var options = {
    host: 'col.cpqpebpi6pjl.us-west-2.rds.amazonaws.com',
    port: 3306,
    user: 'g17',
    password: 'distg17col',
    database: 'NodeStore'
};

var sessionStore = new MySQLStore(options);

app.use(session({
	secret: 'ssshhhhh',
	store: sessionStore,
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
	res.render('login', {
		title: 'Log Ind',
		error: ''
	});
});
app.post('/backLogin', function(req, res){
	res.render('login', {
		title: 'Log Ind',
		error: ''
	});
});
app.get('/index', function(req, res){
	res.render('index', {
		title: 'Hovedmenu',
		permission: sess.user.userType
	});
});
app.post('/wall', function(req, res){
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
});
app.get('/wall', function(req, res){
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
});
app.post('/trash', function(req, res){
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
});
app.get('/trash', function(req, res){
	res.render('trash', {
		title: "Skralde Menu",
		camps: sess.camps,
		weight: sess.weight,
		permission: sess.user.userType,
		error: sess.error
	});
});
app.post('/trash/add', function(req, res){
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
			console.log(error);
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
});
app.get('/users', function(req, res){
	if (sess){
		res.render('users', {
			title: "Bruger Menu",
			token: sess.token,
			error: ""
		});
	}else{
		res.render('users', {
			title: "Bruger Menu",
			token: "",
			error: ""
		});
	}
});
app.post('/users', function(req, res){
	if (sess){
		res.render('users', {
			title: "Bruger Menu",
			token: sess.token,
			error: ""
		});
	}else{
		res.render('users', {
			title: "Bruger Menu",
			token: "",
			error: ""
		});
	}
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
			sess.error = err;
			var json = result.return;
			for (var i = 0; i < json.length; i++) {
				sess.camps[i] = json[i].campName;
			}
			res.render('camps', {
				title: "Camp Menu",
				camps: sess.camps,
				error: ""
			});
		});
	});	
});
app.get('/camp', function(req, res){
	res.render('camps', {
		title: "Camp Menu",
		camps: sess.camps,
		error: sess.error
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
		permission: sess.user.userType
	});
});
app.post('/deleteCamp', function(req, res){
	var name = req.body.selectpicker;
	args = {
		arg0: name,
		arg1: sess.token
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

				sess.token = "";
				sess.error = "";
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
	sess.destroy(function(err){
		res.clearCookie('connect.sid', { path: '/' });
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
app.post('/users/create', function(req, res){
	var uname = req.body.username;
	var pass = req.body.password;
	var repass = req.body.repassword;
	var admin = req.body.ans;
	var token;
	var error;
	if(sess){
		token = sess.token;
		error = sess.error;
	}else{
		token = "";
		error = "";
	}
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
	if(!sess){
		res.redirect('/backLogin');
	}else{
		res.redirect('/users');
	}
});
app.post('/quiz/answer',function(req, res){
	var answer = req.body.ans;
	sess.error = "Tak for svaret";
	console.log(answer);
	res.redirect('/quiz');
});
app.post('/comments',function(req, res){
	sess.comments = [];
	sess.singleID = req.body.message;
	args = {
		arg0: sess.singleID
	}
	soap.createClient(url, function(err, client){
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
	args = {
		arg0: sess.singleID
	}
	soap.createClient(url, function(err, client){
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
});
app.post('/singleMessage.ejs', function(req, res){
	var comment = req.body.message;
	args = {
		arg0: comment,
		arg1: sess.singleID,
		arg2: sess.token
	}
});
app.post('/singleMessage/submit', function(req, res){
	args = {
		arg0: req.body.message,
		arg1: sess.singleID,
		arg2: sess.token
	}
	soap.createClient(url, function(err, client){
		client.addComment(args, function(err, result){
			if (err != null){
				console.log(err);
			}else{
				console.log("Comment uploaded for message with id: " + sess.singleID);
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
						res.redirect('/singleMessage.ejs');
					}
				});
			}
		});
	});
});
//Listen on serverport:
app.listen(3000, function(){
	console.log("Server started on port 3000...");
});