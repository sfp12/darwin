var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {		
  res.render('index', { title: data });
});

router.get('/login.html', function(req, res, next) {
  res.render('login.html');
});

router.get('/index.html', function(req, res, next) {
  res.render('index.html');
});


module.exports = router;
