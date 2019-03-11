const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const crypto = require('crypto');
const CT = require('./../check-token');

module.exports = (_app) => {
  _app.post('/change-pass', CT.ensureAuthorized, (_req, _res) => {
    const email = CF.isset(_req.body.email)? _req.body.email : '';
    let oldPass = CF.isset(_req.body.oldPass)? _req.body.oldPass : '';
    oldPass = crypto.createHash('md5').update(oldPass).digest('hex');
		if(email == '' || oldPass == ''){
			httpMsg.show400(_req, _res, "Parameter is missing", "JSON");
		}else {
      const newPassword = crypto.createHash('md5').update(oldPass).digest('hex');
      console.log("Pass : ",newPassword);
	    db.executeSql("SELECT `id`, `name`, `email`, `password`, `photo` FROM admin WHERE email = '"+email+"' AND password = '"+oldPass+"'", (_err1, _data1) => {
	    	if(_err1){
	    		httpMsg.show500(_req, _res, _err1, "JSON");
	    	} else {  
	    		if(_data1 && _data1.length > 0){
		    		if(_data1[0].oldPass == oldPass){
		    			var data ={
		    				status:true,
		    				message:"Password Found",
		    				data:{
                  email:_data1[0].email,
                  password:_data1[0].password,
		    					id:_data1[0].id
                },               
              };
              db.executeSql("UPDATE admin SET `password` = '"+newPassword+"' WHERE `email` = '"+email+"'", (_err1, _data1) => {
                if(_err1){
                  httpMsg.show400(_req, _res, "Email not found", "JSON");
                }else{
                  httpMsg.sendJson(_req, _res, { result: true, message: "Password Updated" });
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