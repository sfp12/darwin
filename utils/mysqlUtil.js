//链接mysql
var database = require('../config').database;
// var mysql = require('mysql');

// //创建连接  
// var client = mysql.createConnection({  
//   user: 'root',  
//   password: 'root', 
//   database: database 
// }); 

// exports.mysql_obj = function(){
// 	return client;
// } 

// exports.connect = function(){
// 	client.connect(function(err){
// 		if(err){
// 		console.error('error connecting:'+err.stack);
// 		return;
// 		}

// 		console.log('connected');
// 	});
// }

var mysql = require('mysql');

var pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    database: database,
    user: 'root',
    password: 'root'
});

module.exports = pool;
 


