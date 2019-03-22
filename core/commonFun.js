var Path = require("path");
var fs = require('fs');
var Config = require('./../config');

exports.getIp = function(req) {
	var ip = req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
	return ip;
}
exports.isset=function(object){
	var value= (typeof object !=='undefined' && object !==null && object !=="" && object !=='null' && object !=='undefined')?true:false;
	return value;
}
exports.sqlstring = function(str) {
	return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
		switch (char) {
			case "\0":
				return "\\0";
			case "\x08":
				return "\\b";
			case "\x09":
				return "\\t";
			case "\x1a":
				return "\\z";
			case "\n":
				return "\\n";
			case "\r":
				return "\\r";
			case "\"":
			case "'":
			case "\\":
			case "%":
				return "\\"+char; // prepends a backslash to backslash, percent,
								  // and double/single quotes
		}
	});
}


var cap= function(string) 
{
	if(string!=null && string!=''){
		string = string.toLowerCase();
		string = string.trim();
		// console.log("cap",string)
		return string[0].toUpperCase() + string.slice(1);
	} else {
		return null;
	}
}
exports.capitalize= cap;

exports.uniqueBy=function(arr, fn) {
	var unique = {};
	var distinct = [];
	arr.forEach(function (x) {
		var key = cap(fn(x));
		if (!unique[key] && key!=null) {
			distinct.push(key);
			unique[key] = true;
		}
	});
	return distinct;
}
exports.varSlug=function(str){
		var slug = '';
		var trimmed = str.trim();
		slug = trimmed.replace(/[^a-z0-9-]/gi, '_').
		replace(/_+/g, '_').
		replace(/^_|_$/g, '');
		return slug.toLowerCase();
}
exports.slug=function(str){
		var slug = '';
		var trimmed = str.trim();
		slug = trimmed.replace(/[^a-z0-9-]/gi, '-').
		replace(/-+/g, '-').
		replace(/^-|-$/g, '');
		return slug.toLowerCase();
}

exports.generateCode = function(NO,DIGIT) {
	var result=0;
	switch(DIGIT) {
		case 2:
			result = 10+parseInt(NO);
			break;
		case 3:
			result = 100+parseInt(NO);
			break;
		case 4:
			result = 1000+parseInt(NO);
			break;
		case 5:
			result = 10000+parseInt(NO);
			break;
		case 6:
			result = 100000+parseInt(NO);
			break;
		default:
			result = 100+parseInt(NO);
	}
	return result;
}

exports.uploadImage = function(_FILE,_PATH,_NAME,_cb){
		var file = _FILE;
		console.log("inner files : ",file)
		var contentType = file.type;
		var tmpPath = file.path;
		var extIndex = tmpPath.lastIndexOf('.');
		var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
		var imgName = _NAME+'.'+extension;
		var destPath = Path.join(Config.mediaFolder,_PATH, imgName);
		// Server side file type checker.
		if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
			_cb("image extension not allowed, please choose a jpeg or png file",null);
		} else {
			fs.rename(tmpPath, destPath, function(err) {
				if (err) {
					_cb("Failed to Uploaded Image : "+err,null);
				} else {
					_cb(null,{name:_NAME,url:Path.join('media',_PATH, imgName)});
				}
			});
		}
}

exports.uploadFile = function(_FILE,_FOLDER,_NAME,_cb){
		var file = _FILE;
		console.log("inner files : ",file)
		var contentType = file.type;
		var tmpPath = file.path;
		var extIndex = tmpPath.lastIndexOf('.');
		var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
		var imgName = _NAME+extension;
		var destPath = Path.join(Config.pdfFolder,_FOLDER, imgName);
		// Server side file type checker.
		if (contentType !== 'application/pdf' && contentType !== 'application/vnd.ms-powerpoint' && contentType !== 'application/ppt' && contentType !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation' && contentType !== 'application/pptx' && contentType !== 'application/vnd.ms-excel' && contentType !== 'application/xls' && contentType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && contentType !== 'application/xlsx' && contentType !== 'application/msword' && contentType !== 'application/doc' && contentType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && contentType !== 'application/docx') {
			_cb("File extension not allowed, please choose a pdf, ppt, pptx, xls, xlsx, doc and docx file",null);
		} else {
			fs.rename(tmpPath, destPath, function(err) {
				if (err) {
					_cb("Failed to Uploaded Image : "+err,null);
				} else {
					_cb(null,{name:_NAME,url:Path.join('/pdf_files',_FOLDER, imgName)});
				}
			});
		}
}

exports.abbrNum = function(number, decPlaces) {
	decPlaces = Math.pow(10,decPlaces);
	var abbrev = [{"label":"K","value":1000},{"label":"Lac","value":100000},{"label":"Cr","value":10000000}];
	for (var i=abbrev.length-1; i>=0; i--) {
		var size = abbrev[i].value;
		if(size <= number) {
			number = Math.round(number*decPlaces/size)/decPlaces;
			number += abbrev[i].label;
			break;
		}
	}
	return number;
}

exports.numAbbr =  function(number) {
	var abbrev = [{"label":"K","value":1000},{"label":"Lac","value":100000},{"label":"Cr","value":10000000}];
	for (var i=abbrev.length-1; i>=0; i--) {
		if(number.search(abbrev[i].label)>=0) {
			number = parseFloat(number)*abbrev[i].value
			break;
		}
	}
	return number;
}

exports.fullPath =  function(_req,_path) {
	return (((_req.connection && _req.connection.encrypted)?'https' : 'http')+"://"+_req.get('host')+_path);
}