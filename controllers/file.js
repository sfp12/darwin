// 上传也有返回值了

// 安装模块
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var async = require('async');

// model
var data_m = require('../models/data');

/**
* 上传文件处理方法，把文件放在mysql blob中
* todo::这里要加上ftp文件转移处理
* 具体做法：把文件内容读出来，按行\r\n切分，再按,切分，最后通过JSON.stringify转为字符串。
*/
exports.uploadify = function(req, res, next){
	var result = {};
	result.status = 0;

	// 获取上传文件，作为一个util
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
		
		if(err){
			console.log('parse error:'+err);
		}else{
			var input_file = files.upload_file[0];
			var uploaded_path = input_file.path;
			var buf = new Buffer(1024*input_file.size);

			// 获取文件的内容，作为一个base
			fs.open(uploaded_path, 'r+', function(err, fd) {
			   if (err) {
			       return console.error(err);
			   }
			   fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
			      if (err){
			         console.log(err);
			      }
			      
			      var a = buf.slice(0, bytes).toString().split('\r\n');
			      var b = a.map(function(a_item){
			      	return a_item.split(',');			      	
			      })

			      // 使用一个异步函数，如果上传成功，就返回值和id，如果上传失败，就提示
			      async.waterfall([
			      	function(cb){
			      		data_m.addData(input_file.originalFilename, JSON.stringify(b), +fields.userId[0], cb);
			      	},
			      	function(value, dataId){
			      		if(value){
			      			var data = {};
			      			data.dataId = dataId;
			      			data.data = JSON.stringify(b);
			      			result.data = data;
			      		}else{
			      			result.data = '上传失败';
			      		}
			      		res.send(JSON.stringify(result));
			      	}
			      	], function(err, value){
			      		console.log('err:'+err);
			      		console.log('value:'+value);
			      	})
			      

			   });
			});
		}
	})

	// res.send(JSON.stringify(result)); 
}

/**
* 下载文件
* 
*/
exports.download = function(req, res, next){
	// 网上有很多现成的方法
	var user_id = req.query.userId;
	var data_id = req.query.dataId;

	async.waterfall([
		function(cb){
			data_m.getDataById(data_id, user_id, cb);
		},
		function(results, cb){
			var result = results[0];
			var filename = result.data_name;
			res.set({
				'Content-Type': 'application/vnd.ms-excel',
				'Content-Disposition': 'attachment;filename='+filename,
				'Pragma': 'No-cache',
				'Expires': 0,
				'Cache-Control': 'No-cache'
			});
			var str = result.data_info.toString(); 
			res.send(str);

		}
		], function(err, value){
		console.log('err:'+err);
		console.log('value:'+value);
	})
}

