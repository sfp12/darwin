var express = require('express');
var file_c = require('../controllers/file');

// 创建router对象
var file = express.Router();

// 上传文件
file.post('/uploadify', file_c.uploadify);

// 下载文件
file.get('/download', file_c.download);

module.exports = file;