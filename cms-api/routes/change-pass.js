const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const crypto = require('crypto');
const CT = require('./../check-token');

module.exports = (_app) => {
  _app.post('/change-pass', CT.ensureAuthorized, (_req, _res) => {
  	let oldPass = CF.isset(_req.body.oldPass)? _req.body.oldPass : '';
    let newPass = CF.isset(_req.body.newPass)? _req.body.newPass : '';

    // console.log("incrr : ",crypto.createHash('md5').update(oldPass).digest('hex'))
		if(oldPass == '' || newPass == ''){
			httpMsg.show400(_req, _res, "Parameter is missing", "JSON");
		} else {

      // console.log("before password : ",oldPass,newPass);
	    oldPass = crypto.createHash('md5').update(oldPass).digest('hex');
	    newPass = crypto.createHash('md5').update(newPass).digest('hex');

      // console.log("after password : ",oldPass,newPass);
      // console.log("password : ",oldPass,_req.userData.password);
	    if(_req.userData.password == oldPass){
        db.executeSql("UPDATE admin SET `password` = '"+newPass+"' WHERE `id` = '"+_req.userData.id+"'", (_err1, _data1) => {
          if(_err1){
            httpMsg.show400(_req, _res, "User not found", "JSON");
          }else{
            httpMsg.sendJson(_req, _res, { status: true, message: "Password Updated" });
          }
        }); 
  		}else{
  			httpMsg.sendJson(_req,_res,{ status: false, message:"Password is incorrect" });
  		}
    }
  });
}