

// 安装模块
var async = require('async');
var util = require('util');

// 变量
var data_m = require('../models/data');
var result_m = require('../models/result');
var graph_m = require('../models/graphs');
var database = require('../config').database;
var result_t = require('../config').result_t;
var data_t = require('../config').data_t;
var graph_t = require('../config').graph_t;

// 获取data tables, results, graphs的数据
exports.getIndexData = function(req, res, next){
	// 定义变量
	var data = {};
	data.files = [];
	data.results = {};
	data.graphs = {};
	var result = {
		'status': 0,
		'data': data
	}
	var user_id = req.query.userId;
	var data_map = [];

	async.waterfall([
		function(cb){
			
			var result_str = ['data_id', 'data_name'].join(', ');

			var sql = 'SELECT '+result_str+' FROM '+database+'.'+data_t + ' where  user_id = \'' + user_id + '\' and is_del = 0';
			data_m.getDataList(cb, sql);

		},
		function(data_r, cb){
			// 处理data结果
    		for(var i=0; i<data_r.length; i++){
				var obj = {};
				obj.dataId = data_r[i].data_id;
				obj.dataName = data_r[i].data_name;
				data_map[obj.dataId] = obj.dataName;
				data.files.push(obj);
			}
			cb();
		},
		function(cb){
			var result_str = ['data_id', 'type', 'ret_id'].join(', ');
			
			var sql = 'SELECT '+result_str+' FROM '+database+'.'+result_t + ' where  user_id = \'' + user_id + '\' and is_del = 0';
			
			result_m.getResultList(cb, sql);
		},
		function(result_r, cb){
			// 处理result结果
			for(var i=0; i<result_r.length; i++){
				var data_id = result_r[i].data_id;
				var data_name = data_map[data_id];

				var result_id = 'result_'+data_id;
				if(data.results[result_id] === undefined){
					data.results[result_id] = {};
					data.results[result_id].dataId = data_id;
					data.results[result_id].dataName = data_name;
					data.results[result_id].resultList = [];
				}

				var obj = {};
				obj.resultId = result_r[i].ret_id;
				obj.resultName = data_name+result_r[i].type+'的分析结果';
				obj.resultType = result_r[i].type;
				data.results[result_id].resultList.push(obj);							
			}
			cb(null);
		},
		function(cb){
			var result_str = ['data_id', 'type', 'g_id'].join(', ');

			var sql = 'SELECT '+result_str+' FROM '+database+'.'+graph_t + ' where  user_id = \'' + user_id + '\' and is_del = 0';

			graph_m.getGraphsList(cb, sql);
		},
		function(graph_r, cb){
			// 处理graph结果
			for(var i=0; i<graph_r.length; i++){
				var data_id = graph_r[i].data_id;
				var data_name = data_map[data_id];

				var graphs_id = 'graphs_'+data_id;
				if(data.graphs[graphs_id] === undefined){
					data.graphs[graphs_id] = {};
					data.graphs[graphs_id].dataId = data_id;
					data.graphs[graphs_id].dataName = data_name;
					data.graphs[graphs_id].graphsList = [];
				}

				var obj = {};
				obj.graphsId = graph_r[i].g_id;
				obj.graphsName = data_name+graph_r[i].type+'的分析结果';
				obj.graphsType = graph_r[i].type;
				data.graphs[graphs_id].graphsList.push(obj);
			}
			return res.send(JSON.stringify(result));
		}
		], function(err, result){
		console.log('err:'+err);
		console.log('result:'+result);
	})
}

// 保存数据
exports.save = function(req, res, next){
	var result = {
		'status': 0		
	}

	var data_name = req.body.fileName;
	var data_info = JSON.parse(req.body.fileData).data;	
	var user_id = req.body.userId;
	var data_id = req.body.dataId;

	if(req.body.dataId !== undefined){
		
		async.waterfall([
	      	function(cb){
	      		var sql = 'update '+database+'.'+data_t+' set data_name = \''+data_name+'\', data_info = \''+data_info+'\' where data_id = '+data_id+' and user_id = '+user_id;
	      		data_m.saveData(cb, sql);
	      	},
	      	function(value){
	      		if(value){
	      			result.data = '保存成功';
	      		}else{
	      			result.data = '保存失败';
	      		}
	      		res.send(JSON.stringify(result));
	      	}
      	], function(err, value){
      		console.log('err:'+err);
      		console.log('value:'+value);
      	})

	}else{
		async.waterfall([
	      	function(cb){
	      		var sql = 'insert into '+database+'.'+data_t + ' values (data_id, \'' + data_name + '\', \''+ data_info +'\', '+user_id+', \''+add_time+'\', mod_time, '+0+')';
	      		data_m.addData(cb, sql);
	      	},
	      	function(value, dataId){
	      		if(value){
	      			var data = {};
	      			data.dataId = dataId;
	      			data.data = JSON.stringify(b);
	      			result.data = data;
	      		}else{
	      			result.data = '保存失败';
	      		}
	      		res.send(JSON.stringify(result));
	      	}
      	], function(err, value){
      		console.log('err:'+err);
      		console.log('value:'+value);
      	})
	}
}

// 另存数据
exports.saveAs = function(req, res, next){
	var result = {
		'status': 0		
	}

	var data_name = req.body.fileName;
	var data_info = JSON.parse(req.body.fileData).data;
	var user_id = req.body.userId;
	var data_id = req.body.dataId;	
		
	async.waterfall([
      	function(cb){
      		var sql = 'insert into '+database+'.'+data_t + ' values (data_id, \'' + data_name + '\', \''+ data_info +'\', '+user_id+', \''+add_time+'\', mod_time, '+0+')';
      		data_m.addData(cb, sql);
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
 
}

// 保存表名
exports.saveName = function(req, res, next){
	var result = {
		'status': 0		
	}

	var data_id = req.body.dataId;
	var user_id = req.body.userId;
	var data_name = req.body.fileName;

	
	async.waterfall([
      	function(cb){
      		var sql = 'update data set data_name = \''+data_name+'\' where data_id='+data_id+' and user_id='+user_id;
      		data_m.saveName(cb, sql);
      	},
      	function(value){
      		if(value){      			
      			result.data = '保存成功';
      		}else{
      			result.data = '保存失败';
      		}
      		res.send(JSON.stringify(result));
      	}
  	], function(err, value){
  		console.log('err:'+err);
  		console.log('value:'+value);
  	})
}


// 获取data tab 表的数据
exports.get = function(req, res, next){
	var result = {
		'status': 0		
	}

	var data_id = req.body.dataId;
	var user_id = req.body.userId;
	
	if(data_id === undefined){
		result.status = 1;
		result.data = '没有dataId';
		res.send(result);
	}

	async.waterfall([function(cb){
			var sql = 'select * from darwin.data where data_id = '+data_id+' and user_id = '+user_id+' and is_del = 0';
			data_m.getDataById(cb, sql);
		},
		function(data_r, cb){
			result.data = data_r;
			res.send(JSON.stringify(result));
		}
	], function(err, value){
		console.log('err:'+err);
		console.log('result:'+result);
	});
}

// 删除表
exports.delete = function(req, res, next){
	var result = {
		'status': 0
	}

	var data_id = req.body.dataId;
	var user_id = req.body.userId;

	async.waterfall([
		function(cb){
			var sql = 'update data set is_del = 1 where data_id='+data_id+' and user_id='+user_id;
			data_m.deleteData(cb, sql);
		},
		function(delete_d, cb){
			if(delete_d){
				var sql = 'update result set is_del = 1 where data_id='+data_id+' and user_id='+user_id;
				result_m.deleteResult(cb, sql);
			}else{
				cb(null, false)
			}
		},
		function(delete_r, cb){			
			if(delete_r){
				var sql = 'update graphs set is_del = 1 where data_id='+data_id+' and user_id='+user_id;
				graph_m.deleteGraph(cb, sql);
			}else{
				cb(null, false)
			}
		},
		function(delete_g, cb){
			if(delete_g){
				result.data = '删除成功';
				res.send(JSON.stringify(result));
			}else{
				result.data = '删除失败';
				res.send(JSON.stringify(result));
			}
		}
	], function(err, value){
		console.log('err:'+err);
		console.log('value:'+value);
	})	
}

