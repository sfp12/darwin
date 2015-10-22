var crypto = require('crypto');

exports.md5 = function(text) {
	var str_1 = crypto.createHash('md5').update(text).digest('hex');
	return crypto.createHash('md5').update(str_1+'darwin').digest('hex');
};