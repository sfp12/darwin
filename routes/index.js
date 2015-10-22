// 安装的模块
var express = require('express');
var async = require('async');
var session = require('express-session');
var util = require('util');

// 控制器
var indexajax_c = require('../controllers/indexajax');
var login_c = require('../controllers/login');

// 创建router对象
var router = express.Router(); 

// 测试用的代码
router.get('/test.html', function(req, res, next) {	
	res.render('test.html');	
});

// router.get('/test.html', admin.getAdmin);

/* 
* 这里还需要判断session是否有值
*/
router.get('/', function(req, res, next) {
	console.log(util.inspect({session:req.session}));
	if(req.session.userinfo === undefined){
		res.redirect('/login.html');	
	}else{
		res.render('index.html');
	}		
});

// ---------------------权限管理--------------------
// 登录页面
router.get('/login.html', login_c.login);

// 登录
router.post('/login/doLogin', login_c.doLogin); 

// 注册
router.post('/login/register', login_c.register);

// 退出
router.get('/login/logOut', login_c.logOut);  

// --------------------indexajax--------------------
// 获取tree的数据
router.get('/indexajax/getIndexData', indexajax_c.getIndexData);

// 删除文件
router.post('/indexajax/delete/', indexajax_c.delete);

// 修改文件名
router.post('/indexajax/saveName/', indexajax_c.saveName)

// 获取table文件:
router.post('/indexajax/get', indexajax_c.get)


// 保存数据
router.post('/indexajax/save', indexajax_c.save);

// 另存数据
router.post('/indexajax/saveAs', indexajax_c.saveAs);


module.exports = router;























