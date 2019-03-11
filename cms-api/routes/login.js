const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const crypto = require('crypto');
const randomstring = require('randomstring');


module.exports = (_app) => {

  // Get all campaigns
  _app.post('/login', (_req, _res) => {
    const email = CF.isset(_req.body.email)? _req.body.email : '';
		const password = CF.isset(_req.body.password)? _req.body.password : '';
		if(email == '' || password == ''){
			httpMsg.show400(_req, _res, "Parameter is missing", "JSON");
		} else {
      const pwd = crypto.createHash('md5').update(password).digest('hex');
      console.log("hello : ",pwd);
	    db.executeSql("SELECT `id`, `name`, `email`, `password`, `photo` FROM admin WHERE email = '"+email+"'",(_err1, _data1) => {
	    	if(_err1){
	    		httpMsg.show500(_req, _res, _err1, "JSON");
	    	} else {
	    		if(_data1 && _data1.length > 0){
		    		if(_data1[0].password == pwd){
		    			var data ={
		    				status:true,
		    				message:"Successful Login",
		    				data:{
		    					name:_data1[0].name,
		    					image:_data1[0].image,
		    					email:_data1[0].email,
		    					id:_data1[0].id
		    				},
		    				token:crypto.createHash('md5').update(randomstring.generate(3)+email).digest('hex')
		    			};
		    			db.executeSql("INSERT INTO token (`admin_id`,`token`,`browser`,`ip`) VALUES ('"+_data1[0].id+"','"+data.token+"','"+_req.headers["user-agent"]+"','"+CF.getIp(_req)+"')",(_err2, _data2) => {
		    				if(_err2){
		    					httpMsg.show500(_req,_res, _err2,"JSON");
		    				} else {
		    					httpMsg.sendJson(_req,_res,data);
		    				}
		    			});
		    		}else{
		    			httpMsg.sendJson(_req,_res,{status:false,message:"Password is incorrect"});
		    		}
		    	} else {
		    		httpMsg.sendJson(_req,_res,{status:false,message:"Email is not registered"});
		    	}
	    	}
	    });
    }
  });
}