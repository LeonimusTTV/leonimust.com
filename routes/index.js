var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', {isMainPage: true});
});

router.get('/projects', function(req, res, next) {
  res.render('projects', {isMainPage: false});
});


module.exports = router;
