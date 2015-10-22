

// 自己写的公用模块
var mysqlUtil = require('../utils/mysqlUtil');
var cryptoUtil = require('../utils/cryptoUtil');
var util = require('util');

// 变量
var database = require('../config').database;
var user_t = require('../config').user_t;

/*
* 登录检查
*/
exports.checkLogin = function(email, pwd, req, cb){	
	mysqlUtil.getConnection(function(err, client){
		if(err){
			console.log('链接错误');
		}
		client.query(  
		  'SELECT * FROM '+database+'.'+user_t + ' where  email = \'' + email + '\' and pwd = \'' + cryptoUtil.md5(pwd) + '\'' ,  
		  function(err, results, fields) {

		    if (err) { 
		    	console.log('login select wrong'); 
		      	throw err;  
		    } 

		    if(results.length !== 0)
			{	
				req.session.userinfo = req.session.userinfo || '';
				req.session.userinfo = results[0];
				cb(null, 0, results[0].user_name, results[0].user_id);
			}else{
				cb(null, 1);
			};					     
		});	
	});	
}

Date.prototype.Format = function(fmt){ 
	var o = {   
	"M+" : this.getMonth()+1,                 //月份   
	"d+" : this.getDate(),                    //日   
	"H+" : this.getHours(),                   //小时   
	"m+" : this.getMinutes(),                 //分   
	"s+" : this.getSeconds(),                 //秒   
	"q+" : Math.floor((this.getMonth()+3)/3), //季度   
	"S"  : this.getMilliseconds()             //毫秒   
	};   
	if(/(Y+)/.test(fmt))   
	fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
	for(var k in o)   
	if(new RegExp("("+ k +")").test(fmt))   
	fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
	return fmt;   
}

var exec = function(cb, sql, method){
	mysqlUtil.getConnection(function(err, client){
		if(err){
			console.log('链接错误');
		}
		client.query(  
			sql,  
			function(err, results, fields) {
				if (err) {
					throw err; 
					switch(method){
						case 'query':
							break;
						case 'delete':
							cb(null, false);
							break;
						case 'save':
							cb(null, false);
							break;
						case 'add':
							cb(null, false);
							break;
						case 'getDataById':
							break;
						default:
							console.log('base method wrong');
					} 
				}

				client.release();
				switch(method){
					case 'query':
						cb(null, results);
						break;
					case 'delete':
						cb(null, true);
						break;
					case 'save':
						cb(null, true);
						break;
					case 'add':
						cb(null, true, result.insertId);
						break;
					case 'getDataById':
						results[0].data_info = results[0].data_info.toString();
						cb(null, results[0]);
						break;
					default:
						console.log('base method wrong');
				}
			}  
		);
	});
} 

exports.query = function(cb, sql){
	
	exec(cb, sql, 'query');

};

exports.delete = function(cb, sql){
	
	exec(cb, sql, 'delete');

};

exports.save = function(cb, sql){
	
	exec(cb, sql, 'save');

};

exports.add = function(cb, sql){
	
	exec(cb, sql, 'add');

};

exports.getDataById = function(cb, sql){	
	
	exec(cb, sql, 'getDataById');

}














