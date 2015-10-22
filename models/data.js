
// 安装模块
var util = require('util');

// 变量
var base_m = require('../models/base');

// 根据id，获取数据
exports.getDataById = function(cb, sql){

	base_m.getDataById(cb, sql);

}

// 获取data 列表
exports.getDataList = function(cb, sql){

	base_m.query(cb, sql);

}

// 添加数据
exports.addData = function(cb, sql){
		
	base_m.add(cb, sql);

}

// 保存数据
exports.saveData = function(cb, sql){	
	
	base_m.save(cb, sql);

}

// 保存表名
exports.saveName = function(cb, sql){

	base_m.save(cb, sql);

}

// 删除数据
exports.deleteData = function(cb, sql){

	base_m.delete(cb, sql);

}