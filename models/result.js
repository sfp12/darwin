var base_m = require('../models/base');

// 获取数据
exports.getDataById = function(){

}

// 获取result 的列表
exports.getResultList = function(cb, sql){

	base_m.query(cb, sql);
	
}

//删除result中得数据
exports.deleteResult = function(cb, sql){

	base_m.delete(cb, sql);

}

