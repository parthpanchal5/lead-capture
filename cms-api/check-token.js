const httpMsg = require('./../core/httpMsg');
const CF = require('./../core/commonFun');
const db = require('./../core/db');

module.exports={
  ensureAuthorized: (_req,_res, _next)=>{
	  //console.log("auth token : ",req.headers.authorization);
	  let authorization=[];
	  if(_req.headers.authorization || _req.query.auth){
		  if(_req.headers.authorization){
			authorization = _req.headers.authorization.split(" ");
		  } else {
			authorization = _req.query.auth.split(" ");
		  }
		  
		  // console.log(authorization[1]);
		  if(authorization[0] == 'Bearer'){
			  db.executeSql("select t.id as token_id, u.* from token as t inner join admin as u on u.id = t.admin_id  where t.token = '"+authorization[1]+"'",(err1,data1)=>{
				  if(err1){
					  httpMsg.show500(_req,_res,err1,"JSON");
				  } else {
					  if(data1 && data1.length>0){
						  _req.userData = data1[0];
						  db.executeSql("update token set browser='"+_req.headers["user-agent"]+"', ip='"+CF.getIp(_req)+"' where id = '"+_req.userData.token_id+"'",(err2,data2)=>{
							  if(err2){
								  httpMsg.show500(_req,_res,err2,"JSON");
							  } else {
								  _next();
							  }
						  });
					  } else {
						  httpMsg.sendJson(_req,_res,{status:false, message: "Token is expire, please login again."});
					  }
				  }
			  });
					  
		  } else {
			  httpMsg.sendJson(_req,_res,{status:false, message: "Token in wrong format."});
		  }
	  } else {
		  httpMsg.sendJson(_req,_res,{status:false, message: "Token is compulsory."});
	  }
  }

}