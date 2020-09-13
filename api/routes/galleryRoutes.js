'use strict';
module.exports = function(apiRoutes) {
  var multer = require("multer");

  var gallery = require('../controllers/galleryController');

  apiRoutes.get('/listallimages', gallery.list_all_images);
  apiRoutes.get('/listfeaturedimages', gallery.list_featured_images);
  apiRoutes.post('/uploadimages', gallery.uploadimages);
  apiRoutes.post('/uploadtempimages', gallery.upload_images_to_temp);
  apiRoutes.post('/uploadimagestolocal', gallery.upload_images_to_local);
  apiRoutes.post('/videoUpload', multer().any(), gallery.videoUpload);
  apiRoutes.get('/listBucketObjects', gallery.getObjectListing);

  // app.route('/tasks/:taskId')
  //   .get(todoList.read_a_task)
  //   .put(todoList.update_a_task)
  //   .delete(todoList.delete_a_task);
};
