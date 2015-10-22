var express = require('express');

// 创建router对象
var admin = express.Router();

/* GET home page. */
admin.get('/', function(req, res, next) {		
  // res.render('index.html');
  console.log('admin');
});

// admin/getAdmin
admin.get('/getAdmin', function(req, res, next) {		
  // res.render('index.html');
  console.log('get admin');
});

module.exports = admin;

