const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const CT = require('./../check-token');

module.exports = (_app) => {

  // All data
  _app.get('/profile' ,CT.ensureAuthorized, (_req, _res) => {
    httpMsg.sendJson(_req, _res, { status:true, message:"Successful", data:_req.userData });
  });

  _app.get('profile/:id', CT.ensureAuthorized, (_req, _res) => {
      const id = (_req.params.id)?_req.params.id: '';
      if(id == ''){
        httpMsg.show403(_req, _res, "ID is missing");
      }else{
        db.executeSql("SELECT * FROM profile WHERE id = '"+_req.params.id+"'", (_err, _data) => {
          if(_err){
            httpMsg.show500(_req, _res, _err);
          }else {
            if(_data && _data.length > 0){
              httpMsg.sendJson(_req, _res, { status:true, message:"Success", data:_data[0] });
            } else {
              httpMsg.sendJson(_req, _res, { status:false, message:"Fail", data:{} });
            }
          }
        });
      }
  });

  _app.post('/change-password/:id', CT.ensureAuthorized, (_req, _res) => {
    const id = (_req.params.id)?_req.params.id: '';
    const profile = {
      "id": (_req.params.id)?_req.params.id:'',
      "profile_desc":(_req.body.profile_desc)?_req.body.profile_desc:'',
      "ip": CF.getIp(_req)
    };
    if(id == ''){
      httpMsg.show403(_req, _res, "Id is missing");
    }else{
      let sql = "UPDATE profile SET `profile_desc` = '"+profile.profile_desc+"' WHERE id = '"+id+"'";
      let msg = "Updated";
      console.log("SQL: "+ sql);
      db.executeSql(sql, (_err, _data) => {
        if(_err){
          httpMsg.sendJson(_req, _res, _err, "JSON");
        }else{
          httpMsg.sendJson(_req, _res, { status: true, message: msg });
        }
      });
    }
  });

  // Insert or Update
  _app.post('/profile', CT.ensureAuthorized, (_req, _res) => {
    const id = (_req.body.id)?_req.body.id:'';
    const profile = {
      "name": (_req.body.name)?_req.body.name:'',
      "profile_desc": (_req.body.profile_desc)?_req.body.profile_desc:'',
      "logo": (_req.body.logo)?_req.body.logo:'',
      "admin_id": (_req.body.admin_id)?_req.body.admin_id:'',
      "admins_id": (_req.body.admins_id)?_req.body.admins_id:'',
      "status": (_req.body.status)?_req.body.status:'',
      "ip" : CF.getIp(_req)
    }
    let sql = '';
    let msg = '';
    if(id == ''){
      sql = "INSERT INTO profile (`name`, `profile_desc`, `logo`, `admin_id`, `admins_id`, `status`, `inserted_on`, `ip`) VALUES ('"+profile.name+"', '"+profile.profile_desc+"', '"+profile.logo+"', "+profile.admin_id+", "+profile.admins_id+", "+profile.status+", now(), '"+profile.ip+"')";
      msg = "Inserted Successfully";
      console.log("SQL: ", sql);
    }else{
      sql = "UPDATE profile SET name = '"+_req.body.name+"', profile_desc = '"+_req.body.profile_desc+"', logo = '"+_req.body.logo+"', admin_id = '"+_req.body.admin_id+"',  admins_id = '"+_req.body.admins_id+"', status = '"+_req.body.status+"', ip = '"+_req.body.ip+"' WHERE id = '"+id+"'";
      msg = "Updated Successfully";  
    }
    db.executeSql(sql, (_err, _data) => {
      if(_err){
        httpMsg.show500(_req, _res, _err, "JSON");
      } else {
        httpMsg.sendJson(_req, _res, { status: true, message:msg });
      }
    });
  });

  _app.get('/logout', CT.ensureAuthorized, (_req, _res) => {
    db.executeSql("DELETE from token WHERE id = '" + _req.userData.token_id + "'", (_err, _data) => {
      console.log('Successfully Logged Out', _data);
      if(_err){
        httpMsg.show500(_req, _res, _err);
      } else {
        httpMsg.sendJson(_req, _res, { status:true, message:"Successfully Logout"});
      }
    });
  });
} 