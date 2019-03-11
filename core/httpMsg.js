// 500: Server Error => { Server cannot process request for an unknown reason }
// 404: Not Found => { Client was able to communicate with a given server, but the server could not find what was requested }
exports.show500N404 = (_req, _res, _err, _type) => {
  const result = {
		title : (err.status === 404)? "Page not found" : "Internal server error",
		hStatus : _err.status || 500,
		error: (err.status === 404)? "Oops, This Page Could Not Be Found!" : "Oops, There is server error",
		message: _err.message,
  };
	if(_type === "HTML"){
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "text/html" });
  	_res.write("<!DOCTYPE html><html><head><title>"+result.hStatus+" | "+result.title+"</title></head><body><h3>"+result.hStatus+" | "+result.title+"</h3><p>"+result.message+"</p></body></html>");
	} else {
    _res.writeHead(result.hStatus, result.title, { "Content-Type": "application/json" });
    _res.write(JSON.stringify(result));
    _res.end();
  }
}


// 404: Not Found => { Client was able to communicate with a given server, but the server could not find what was requested }
exports.show404 = (_req, _res ,_err, _type) => {
	const result = {
		title : "Page not found",
		hStatus : 404,
		error: "Oops, This Page Could Not Be Found!",
		message: _err,
	};
	if(_type === "HTML"){
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "text/html" });
		_res.write("<!DOCTYPE html><html><head><title>"+result.hStatus+" | "+result.title+"</title></head><body><h3>"+result.hStatus+" | "+result.title+"</h3><p>"+result.message+"</p></body></html>");
	} else {
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "application/json" });
		_res.write(JSON.stringify(result));
		_res.end();
	}
}


// 400: Bad Request => {  The server cannot or will not process the request due to something that is understand to be a client error }
exports.show400 = (_req,_res,_err, _type) => {
	const result = {
		title : "Bad _reques",
		hStatus : 400,
		error: "Bad _request. Invalid input parameters",
		message: _err,
	};
	if(_type === "HTML"){
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "text/html" });
		_res.write("<!DOCTYPE html><html><head><title>"+result.hStatus+" | "+result.title+"</title></head><body><h3>"+result.hStatus+" | "+result.title+"</h3><p>"+result.message+"</p></body></html>");
	} else {
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "application/json" });
		_res.write(JSON.stringify(result));
		_res.end();
	}
}


// 401: Unauthorized Access Error => { The page you were trying to access cannot be loaded until you first log in with a valid user ID and password }
exports.show401 = (_req,_res,_err, _type)=>{
	const result = {
		title : "Unauthorized",
		hStatus : 401,
		error: "Unauthorized. API Token invalid or expired",
		message: _err,
	};
	if(_type === "HTML"){
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "text/html" });
		_res.write("<!DOCTYPE html><html><head><title>"+result.hStatus+" | "+result.title+"</title></head><body><h3>"+result.hStatus+" | "+result.title+"</h3><p>"+result.message+"</p></body></html>");
	} else {
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "application/json" });
		_res.write(JSON.stringify(result));
		_res.end();
	}
}

// 403: Forbidden Error => { The page or resource you were trying to reach is absolutely forbidden for some reason. }
exports.show403 = (_req,_res,_err, _type)=>{
	const result = {
		title : "Tampered URL",
		hStatus : 403,
		error: "Forbidden. Tampered URL",
		message: _err,
	};
	if(_type === "HTML"){
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "text/html" });
		_res.write("<!DOCTYPE html><html><head><title>"+result.hStatus+" | "+result.title+"</title></head><body><h3>"+result.hStatus+" | "+result.title+"</h3><p>"+result.message+"</p></body></html>");
	} else {
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "application/json" });
		_res.write(JSON.stringify(result));
		_res.end();
	}
}


// 410: Resources completely gone => { The server returns this response when the requested resource has been permanently removed. }
exports.show410 = (_req,_res,_err, _type)=>{
	const result = {
		title : "URL expired",
		hStatus : 410,
		error: "URL expired",
		message: _err,
	};
	if(_type === "HTML"){
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "text/html" });
		_res.write("<!DOCTYPE html><html><head><title>"+result.hStatus+" | "+result.title+"</title></head><body><h3>"+result.hStatus+" | "+result.title+"</h3><p>"+result.message+"</p></body></html>");
	} else {
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "application/json" });
		_res.write(JSON.stringify(result));
		_res.end();
	}
}


// 500: Server Error => { Server cannot process request for an unknown reason }
exports.show500 = (_req,_res, _err, _type)=>{
	const result = {
		title : "Internal server error",
		hStatus : 500,
		error: "Oops, There is server error",
		message: _err,
	};
	if(_type === "HTML"){
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "text/html" });
		_res.write("<!DOCTYPE html><html><head><title>"+result.hStatus+" | "+result.title+"</title></head><body><h3>"+result.hStatus+" | "+result.title+"</h3><p>"+result.message+"</p></body></html>");
	} else {
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "application/json" });
		_res.write(JSON.stringify(result));
		_res.end();
	}
};


// 503: Service Unavailable => { The server is currently unable to handle the request due to a temporary overloading or maintenance of the serve }
exports.show503 = (_req, _res, _err, _type)=>{
	const result = {
		title : "Service unavailable",
		hStatus : 503,
		error: "Oops, There is server unavailable",
		message: _err,
	};
	if(_type === "HTML"){
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "text/html" });
		_res.write("<!DOCTYPE html><html><head><title>"+result.hStatus+" | "+result.title+"</title></head><body><h3>"+result.hStatus+" | "+result.title+"</h3><p>"+result.message+"</p></body></html>");
	} else {
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "application/json" });
		_res.write(JSON.stringify(result));
		_res.end();
	}
};


// 599: Network Connect Timeout Error => { This status code is not specified in any RFCs, but is used by some HTTP proxies to signal a network connect timeout behind the proxy to a client in front of the proxy. }
exports.show599 = (_req, _res, _err, _type)=>{
	const result = {
		title : "Connection timed out",
		hStatus : 599,
		error: "Connection timed out",
		message: _err,
	};
	if(_type === "HTML"){
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "text/html" });
		_res.write("<!DOCTYPE html><html><head><title>"+result.hStatus+" | "+result.title+"</title></head><body><h3>"+result.hStatus+" | "+result.title+"</h3><p>"+result.message+"</p></body></html>");
	} else {
		_res.writeHead(result.hStatus, result.title, { "Content-Type": "application/json" });
		_res.write(JSON.stringify(result));
		_res.end();
	}
};


// Data: JSON Format
exports.sendJson = (_req, _res, _data)=>{
	_data.hStatus=200;
	_res.writeHead(200, { "Content-Type": "application/json" });
	if(_data){
		_res.write(JSON.stringify(_data));
	}
	_res.end();
};