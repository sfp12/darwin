// 说明：每个函数都有返回值，没有硬编码

// 安装模块
var util = require('util');
var nodemailer = require('nodemailer');
var async = require('async');

// 变量
var mail_from = require('../config').mail_from;
var mail_to = require('../config').mail_to;
var transporter_option = require('../config').transporter_option;
var base_m = require('../models/base');

exports.login = function(req, res, next){
	res.render('login.html');
}

// 登陆
exports.doLogin = function(req, res, next){
	var result = {
		'status': 1,
		'data': '用户名或密码错误'
	}
  
	var email = req.body.email;
	var pwd = req.body.pwd;	 

	async.waterfall([
		function(cb){
			base_m.checkLogin(email, pwd, req, cb);
		},
		function(check_result, user_name, user_id){
			if(check_result === 0){
				result.status = 0;
				result.data = {};
				result.data.userName = user_name;
				result.data.userId = user_id; 
				res.send(JSON.stringify(result));
			}
			if(check_result === 1){
				res.send(JSON.stringify(result));
			} 
		}

		], function(err, value){
			console.log('err:'+err);
			console.log('value:'+value);
	})	
}

// 退出
exports.logOut = function(req, res, next){
	delete req.session.userinfo;
	res.redirect('/login.html');
}

// 获取验证码
exports.getCode = function(){

}

// 注册
exports.register = function(req, res, next){
	var result = {}

	var email = req.body.email;

	async.waterfall([
		function(cb){
			mail(req.body.email, cb);
		},
		function(email_result){
			if(email_result){
				result.status = 0;
				result.data = '注册成功';
				res.send(result);
			}else{
				result.status = 1;
				result.data = '注册失败';
				res.send(result);
			};
		}
	],function(err, value){
		console.log('err:'+err);
		console.log('value:'+value);
	})
}

// 发送邮件，注册有多种方式，现在选择的是发送邮件，所以单独列出来
var mail = function(email, cb){
	
	var transporter = nodemailer.createTransport(transporter_option);

	var mail_option = {
	    from: mail_from,
	    to: mail_to,
	    subject: 'register ✔', 
	    text: email+' ✔', 
	    html: '<b>'+email+' ✔</b>' 
	};	

	transporter.sendMail(mail_option, function(error, info){
	    if(error){
	    	console.log(error);
	    	cb(null, false);
	    }
	    // console.log('Message sent: ' + info.response);
	    cb(null, true);
	});
}