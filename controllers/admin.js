// admin js css html还没添加，所以先不实现它的功能
var user = require('../models/user');

exports.getAdmin = function(req, res, next){
	user.checkLogin('argu_c');
}