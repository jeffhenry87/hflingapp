var mongoose = require('mongoose');
var passport = require('passport');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: 'info@healthyfling.com',
		pass: 'Photography88'
	}
});

module.exports = function (sd) {
	sd.send = function (opts) {
		transporter.sendMail({
			from: 'Healthy Fling <info@healthyfling.com>',
			to: opts.to,
			subject: opts.title,
			html: opts.html
		}, function (error, info) { });
	}

	const User = sd.User;
	sd.app.use(passport.initialize());
	sd.app.use(passport.session());
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});
	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user._doc);
		});
	});
	/*
	*	Initialize User and Mongoose
	*/
	var router = sd.express.Router();
	sd.app.use('/api/user', router);
	router.get("/me", function (req, res) {
		var json = {};
		if (req.user) {
			User.schema.eachPath(function (path) {
				path = path.split('.')[0];
				if (path == 'password' || path == '__v' || json[path]) return;
				json[path] = req.user[path];
			});
		} else {
			json.data = req.session.data;
		}
		if (!json.data) json.data = {};
		res.json(json);
	});
	
	router.post("/status", function (req, res) {
		if (req.user) {
			let user = JSON.parse(JSON.stringify(req.user));
			delete user.password;
			delete user.recPass;
			delete user.recUntil;
			return res.json({
				user: user
			});
		}

		User.findOne({
			$or: [{
				reg_email: req.body.email.toLowerCase()
			}, {
				email: req.body.email.toLowerCase()
			}]
		}, function (err, user) {
			var json = {};
			json.email = !!user;
			if (user && !user.password) {
				if (!user.data) user.data = {};
				user.data.resetPin = Math.floor(Math.random() * (999999 - 100000)) + 100000;
				console.log(user.data.resetPin);
				user.data.resetCreate = new Date().getTime();
				user.data.resetCounter = 3;
				user.markModified('data');
				user.save(() => { });
				sd.send({
					to: user.email,
					title: 'Code: ' + user.data.resetPin,
					html: 'Code: ' + user.data.resetPin
				}, function () {
					//res.json(true);
				});
				json.force = true;
			} else if (user && req.body.password) {
				json.pass = user.validPassword(req.body.password);
			} else {
				req.session.resetPin = Math.floor(Math.random() * (999999 - 100000)) + 100000;
				console.log(req.session.resetPin);
				req.session.resetCreate = new Date().getTime();
				req.session.resetCounter = 3;
				sd.send({
					to: req.body.email.toLowerCase(),
					title: 'Code: ' + req.session.resetPin,
					html: 'Code: ' + req.session.resetPin
				}, function () {
					// res.json(true);
				});
			}
			res.json(json);
		});
	});
	
	router.post("/request", function (req, res) {
		User.findOne({
			email: req.body.email.toLowerCase()
		}, function (err, user) {
			if (err || !user) return res.send(false);
			if (!user.data) user.data = {};
			user.data.resetPin = Math.floor(Math.random() * (999999 - 100000)) + 100000;
			console.log(user.data.resetPin);
			user.data.resetCreate = new Date().getTime();
			user.data.resetCounter = 3;
			user.markModified('data');
			user.save(function (err) {
				if (err) throw err;
				res.json(true);
				sd.send({
					to: user.email,
					title: 'Code: ' + user.data.resetPin,
					html: 'Code: ' + user.data.resetPin
				}, function () {
					//res.json(true);
				});
			});
		});
	});

	router.post("/change", function (req, res) {
		User.findOne({
			email: req.body.email.toLowerCase()
		}, function (err, user) {
			var message;
			var now = new Date().getTime();
			if (user.data.resetCounter > 0 && (now - user.data.resetCreate) <= 600000) {
				if (user.data.resetPin == req.body.code) {
					user.password = user.generateHash(req.body.password);
					message = 'done';
					delete user.data.resetPin;
					delete user.data.resetCounter;
					delete user.data.resetCreate;
				} else {
					user.data.resetCounter--;
					message = 'wrong';
				}
			} else {
				message = 'retry'
				delete user.data.resetPin;
				delete user.data.resetCounter;
				delete user.data.resetCreate;
			}
			user.markModified('data');
			user.save(function (err) {
				if (err) throw err;
				res.json({
					message: message
				});
			});
		});
	});

	router.post("/changePassword", sd.ensure, function (req, res) {
		sd.User.findOne({
			_id: req.user._id
		}, function (err, user) {
			if (user.validPassword(req.body.oldPass)) {
				user.password = user.generateHash(req.body.newPass);
				user.save(function () {
					res.json(true);
				});
			} else res.json(false);
		});
	});

	router.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});

	router.get('/logout-local', function (req, res) {
		req.logout();
		res.json(true);
	});

	/*
	*	Passport Management
	*/
	var LocalStrategy = require('passport-local').Strategy;
	router.post('/login-local', passport.authenticate('login-local'), function (req, res) {
		let user = JSON.parse(JSON.stringify(req.user));
		delete user.password;
		delete user.recPass;
		delete user.recUntil;
		res.json(user);
	});

	passport.use('login-local', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	}, function (email, password, done) {
		User.findOne({
			email: email.toLowerCase(),
			blocked: {
				$ne: true
			}
		}, function (err, user) {
			if (err) return done(err);
			
			if (!user) {
				return done(null, false, {"message": "wrongEmail"});
			}
			
			if (!user.validPassword(password)) {
				return done(null, false, { message: 'Incorrect password.' });
			}

			return done(null, user);
		});
	}));

	router.post('/signup-local', function (req, res, next) {
		if (req.session.resetPin == req.body.code) {
			next();
		} else {
			res.json({
				message: 'Your code is incorrect'
			});
		}
	}, passport.authenticate('signup'), function (req, res) {
		let user = JSON.parse(JSON.stringify(req.user));
		delete user.password;
		delete user.recPass;
		delete user.recUntil;
		res.json(user);
	});

	passport.use('signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, function (req, email, password, done) {
		User.findOne({
			'email': email.toLowerCase()
		}, function (err, user) {
			if (err) return done(err);
			if (user) return done(null, false);
			else {
				var newUser = new User();
				newUser.is = {
					admin: false
				};
				newUser.name = req.body.name;
				newUser.email = email.toLowerCase();
				newUser.password = newUser.generateHash(password);
				newUser.data = req.session.data && typeof req.session.data == 'object' && req.session.data || {};
				newUser.save(function (err) {
					if (err) throw err;
					return done(null, newUser);
				});
			}
		});
	}));
	// End of Crud
};