const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
module.exports = function(waw){
	var sessionMaxAge = 365 * 24 * 60 * 60 * 1000;
	if(typeof waw.config.session == 'number'){
		sessionMaxAge = waw.config.session;
	}	
	var store = new(require("connect-mongo")(session))({
		url: waw.config.database
	});
	waw.app.use(session({
		key: 'express.sid.'+waw.config.prefix,
		secret: 'thisIsCoolSecretFromWaWFramework'+waw.config.prefix,
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: sessionMaxAge,
			domain: waw.config.domain||undefined
		},
		rolling: true,
		store: store
	}));
	waw.store = store;

	waw.app.use(cookieParser());
	waw.app.use(methodOverride('X-HTTP-Method-Override'));
	waw.app.use(bodyParser.urlencoded({
		'extended': 'true',
		'limit': '50mb'
	}));
	waw.app.use(bodyParser.json({
		'limit': '50mb'
	}));
	/*
	*	Helpers
	*/
		waw.router = function(api){
			var router = waw.express.Router();
			waw.app.use(api, router);
			return router;
		}
	/*
	*	Express Middleware Support
	*/
		waw.next = (req, res, next)=>next()
		waw.ensure = (req, res, next)=>{
			if(req.user) next();
			else res.json(false);
		}
	/*
	*	Move to helper
	*/
		const _serial = function(i, arr, callback, custom_call){
			if(i>=arr.length) return callback();
			if(typeof custom_call == 'function'){
				custom_call(arr[i], function(){
					_serial(++i, arr, callback, custom_call);
				});
			}else{
				arr[i](function(){
					_serial(++i, arr, callback, custom_call);
				});
			}
		}
		const serial = (arr, callback, custom_call) => _serial(0, arr, callback, custom_call);
		waw.afterWhile = (timeout, cb, time)=>{
			if(typeof timeout == 'function'){
				if(typeof cb == 'number'){
					time = cb;
				}
				cb = timeout;
				timeout = this;
			}
			if(typeof time != 'number'){
				time = 1000;
			}
			clearTimeout(timeout._timeout);
			timeout._timeout = setTimeout(cb, time);
		};
	/*
	*	End of
	*/
}