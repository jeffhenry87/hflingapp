'use strict';

const sharp = require('sharp');
const fs = require('fs');
const request = require('request');

var Post = require('../models/post');

var cloudinary = require('cloudinary');
var tempcloudinary = require('cloudinary');
var url  = require('url');
var local_file_path = "";

var uuid = require('uuid');
var mime = require('mime-types');
var { Storage } = require('@google-cloud/storage');

const projectId = "healthyfling-202803";
const storage = new Storage({
	projectId: projectId,
	keyFilename: './api/helper/key.json',
});

var multer = require('multer');
const { createPublicKey } = require('crypto');
//var files_location = "/home/soft/hflingapp/public/files";
var files_location = __dirname + '/../../public/files';

if (!fs.existsSync(files_location)) {
	fs.mkdirSync(files_location);
}
var ownStorage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, files_location);
	},
	filename: function(req, file, callback) {
		var file_name = file.fieldname + "_" + Date.now() + "_" + file.originalname.replace(/\s+/g, '_').toLowerCase();
		callback(null, file_name);
		local_file_path = file_name;
	}
});

var upload = multer({
	storage: ownStorage
}).array("imgUploader", 3); //Field name and max count

exports.upload_images_to_local = function(req, res) {
	upload(req, res, function(err) {
		let file = files_location+'/'+local_file_path;
		if (err) {
			return res.end("Something went wrong!");
		}
		if (req.query.original) {
			sharp(file).resize({ width: 1200 }).toFile(file.replace('files', 'processed')).then(function(newFileInfo) {
				res.json({"secure_url": req.headers.origin + '/processed/' + local_file_path});
			}).catch(function(err) {
				return res.end("Sharp Failed from Origin");
			});
		} else {
			sharp(file).resize({ width: 500 }).toFile(file.replace('files', 'processed')).then(function(newFileInfo) {
				res.json({"secure_url": req.headers.origin + '/processed/' + local_file_path});
			}).catch(function(err) {
				return res.end("Sharp Failed");
			});
		}
	});
};

cloudinary.config({
	cloud_name: 'dosxjzleb',
	api_key: '652824273966278',
	api_secret: 'K2oWfPXPXTm9PTGZD47bFQnIGAI'
});

tempcloudinary.config({
	cloud_name: 'intellirio-consultancy-and-labs-llp',
	api_key: '579673852831583',
	api_secret: 'BCArjT98AV1jmrSwL45DNnlK_DE'
});

exports.list_all_images = function(req, res) {
	cloudinary.v2.api.resources(function(error, result){
		res.json(result.resources);
	});
};

exports.uploadimages = function(req, res) {
	cloudinary.v2.uploader.upload(req.body.url, function(error, result) {
		if (result) {
			res.json(result);
		}else{
			res.json(error);
		}
	});
};

exports.list_featured_images = function(req, res) {
	var query_params = url.parse(req.url,true).query;
	if(query_params.tagId != undefined){
		cloudinary.v2.api.resources_by_tag(query_params.tagId, function(error, result){
			res.json(result.resources);
		});
	}else{
		cloudinary.v2.api.resources(function(error, result){
			res.json(result.resources);
		});
	}
};

exports.upload_images_to_temp = function(req, res) {
	tempcloudinary.v2.uploader.upload(req.body.url, function(error, result) {
		if (result) {
			res.json(result);
		}else{
			res.json(error);
		}
	});
};

exports.download_from_url_and_process = function(item, postId, callback) {
	if (!item ||(item && !item.secure_url)) {
		return;
	}
	var download = function(link, imagePath, callback) {
		request(link).pipe(fs.createWriteStream(files_location + '/' + imagePath)).on('close', callback);
	};
	let fileName = item.secure_url.split('/');
	fileName = fileName.filter(function(el) {
		return el != '';
	});
	fileName = fileName[fileName.length-1];
	let imagePath = "imgURL_" + Date.now() + "_" + fileName.toLowerCase();
	// Downlaod
	download(item.secure_url, imagePath, function() {
		let file = files_location+'/'+imagePath;
		// Compress
		sharp(file).resize({ width: 500 }).toFile(file.replace('files', 'processed')).then(function(newFileInfo) {
			// Update post and add image url
			Post.update({
				_id: postId
			}, {
				$push: {
					files: {
						secure_url: 'https://www.healthyfling.com/processed/' + imagePath,
						signature: item.signature
					}
				}
			}, function(err, result) {
				return true;
			});
		}).catch(function(err) {
			return false;
		});
	});
};

// exports.videoUpload = async function(req, res) {
// 	// var readFile = fs.createReadStream(req);
// 	// fs.writeFile('./temp.mp4', req.body.file, (err, res) => {
// 	// 	if(!err)
// 	// 		console.log('Done');
// 	// });

// 	// var uploadHandler = multer({
// 	// 	storage: multerGoogleStorage.storageEngine()
// 	// });

// 	// uploadHandler.any();

// 	// gcpHelper.createBucket(function() {
// 	// 	res.json('200');
// 	// });

// 	var keyFile = require(process.env.GCS_KEYFILE);
// 	console.log('env = ', process.env.GCS_KEYFILE, ' == ', keyFile);
// 	// console.log(JSON.parse(req.files));
// 	// res.json(req.files);
// 	// console.log('inside videoUpload = ', req);
// 	// res.json('200');
// 	// return;
// }

exports.videoUpload = async (req, res) => {
	// console.log(req.files);
	const bucketName = "hf-media";
	const originalName = req.files && req.files.length ? req.files[0].originalname : (req.file ? req.file.originalname : null);
	let buffer = req.files && req.files.length ? req.files[0].buffer : (req.file ? req.file.buffer : null);

	if(!buffer) {
		res.status(400).json({data: 'Bad request'});
		return;
	}

	const type = mime.lookup(originalName);

	const bucket = storage.bucket(bucketName);
	const blob = bucket.file(`${uuid.v4()}.mp4`);

	const stream = blob.createWriteStream({
		resumable: true,
		contentType: type,
		predefinedAcl: 'publicRead',
	});

	stream.on('error', err => {
		res.status(500).json({data: err});
		return;
	});

	stream.on('finish', () => {
		res.status(200).json({
			data: {
				url: `https://storage.googleapis.com/${bucket.name}/${blob.name}`,
			}
		});
		return;
	});

	stream.end(buffer);
};

exports.getObjectListing = async function listFiles(req, res) {
	const bucketName = "hf-media";
	const result = [];
	// Lists files in the bucket
	const [files] = await storage.bucket(bucketName).getFiles();
  
	console.log('Files:');
	files.forEach(file => {
	  console.log(file.name);
	  result.push(file.name);
	});
	res.status(200).json({
		data: result
	});
	return;
  }
