var base_m = require('../models/base');

// 获取graphs 的列表
exports.getGraphsList = function(cb, sql){

	base_m.query(cb, sql);
	
}

//删除result中得数据
exports.deleteGraph = function(cb, sql){

	base_m.delete(cb, sql);

}