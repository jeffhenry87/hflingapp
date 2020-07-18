const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const User   = require('./api/models/user');
const Post   = require('./api/models/post');
const Page   = require('./api/models/page');
const waw = {
	express: express,
	app: app,
	config: require('./config'),
	Page: Page,
	Post: Post,
	User: User,
	ensure: function(req, res, next){
		if(req.user) next();
		else res.send(false);
	}
};
if (fs.existsSync(__dirname+'/local.js')) {
	let config = require('./local.js');
	if(config){
		for(let each in config){
			waw.config[each] = config[each]
		}
	}
}
const mongoose    = require('mongoose');
mongoose.connect(waw.config.database, {
	useUnifiedTopology: true,
	useNewUrlParser: true,
	useCreateIndex: true
});
mongoose.Promise = global.Promise;
const apiRoutes = express.Router();
waw.router = apiRoutes;
require(__dirname+'/server/sem/index.js')(waw);
require(__dirname+'/server/user/auth.js')(waw);
require(__dirname+'/server/post/index.js')(waw);
require(__dirname+'/server/page/index.js')(waw);


app.set('superSecret', waw.config.secret); // secret variable
const rendertron = require('rendertron-middleware');
const BOTS = rendertron.botUserAgents.concat('googlebot', 'Slack-ImgProxy', 'Slackbot-LinkExpanding', 'Viber');
const BOT_UA_PATTERN = new RegExp(BOTS.join('|'), 'i');
// Render middleware for crawler bots
app.use(rendertron.makeMiddleware({
	proxyUrl: 'http://68.66.207.52:3000/render',
	userAgentPattern: BOT_UA_PATTERN
}));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'files')));
// app.use(function (req, res, next) {
// 	User.findOne({
// 		tempAccessToken: req.headers['authorization']
// 	}, (err, user) => {
// 		if (err) {
// 			return next(err);
// 		}

// 		req.user = user;
// 		return next();
// 	}).lean();
// });
const CryptoJS = require("crypto-js");
const jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
apiRoutes.post('/authenticate', function(req, res) {
	User.findOne({
		name: req.body.name
	}, function(err, user) {
		if (err) throw err;
		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user) {
			var bytes  = CryptoJS.AES.decrypt(user.password, config.key);
			var password = bytes.toString(CryptoJS.enc.Utf8);
			if (password != req.body.password) {
				res.json({ success: false, message: 'Authentication failed. Wrong password.' });
			} else {
				const payload = {
					admin: user.admin
				};
				var token = jwt.sign(payload, app.get('superSecret'));
				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
			}
		}
	});
});
var routes = require('./api/routes/galleryRoutes'); //importing route
routes(apiRoutes);
var userRoutes = require('./api/routes/userRoutes'); //importing route
userRoutes(apiRoutes);
var postRoutes = require('./api/routes/postRoutes'); //importing route
postRoutes(apiRoutes);
var mailRoutes = require('./api/routes/mailRoutes'); //importing route
mailRoutes(apiRoutes);
// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);
app.use('/*', (req, res, next) => {
	if(req.originalUrl.indexOf('/api/')==0) console.log(req.originalUrl);
	if(req.originalUrl.indexOf('/api/')==0) return next();
	res.sendFile(__dirname + '/public/index.html');
});
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

const port = process.env.PORT || 8000;
app.listen(port);
console.log('Healthy Fling server started on: ' + port);