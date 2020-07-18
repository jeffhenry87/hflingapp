module.exports = function(sd) {
	var router = sd.express.Router();
	sd.app.use('/api/page', router);
	router.get('/get', sd.ensure, function(req, res){
		sd.Page.find({
			email: req.user.email
		}, function(err, docs){
			res.json(docs);
		});
	});
	router.get('/delete', sd.ensure, function(req, res){
		sd.Page.findOne({
			email: req.user.email,
			_id: req.body._id
		}, function(err, doc){
			doc.status = "inactive";
			doc.save(()=>{
				res.json(true);
			});
		});
	});
}