const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const CT = require('./../check-token');

module.exports = (_app) => {

  // All data
  _app.get('/users',CT.ensureAuthorized, (_req, _res) => {
    var filterSql = (_req.query.name) ? ' AND name LIKE " % ' + _req.query.name + '%"' : '';
    db.executeSql("SELECT * FROM users WHERE NOT status = -1" +filterSql+ " ORDER BY inserted_on desc", (_err, _data) => {
      if(_err){
        httpMsg.show500(_req, _res, _err);
      } else {
        if(_data && _data.length > 0){
          httpMsg.sendJson(_req, _res, { status:true, message:"Success", data:_data });
        } else {
          httpMsg.sendJson(_req, _res, { status:false, message:"Failed", data:[] });
        }
      }
    });
  });

  // Specific data
  _app.get('/user/:id', CT.ensureAuthorized, (_req, _res) => {
    var id = (_req.params.id) ? _req.params.id : '';
    if(id == ''){
      httpMsg.show403(_req, _res, "ID is missing");
    } else {
      db.executeSql("SELECT * FROM users WHERE id = '"+ _req.params.id +"'", (_err, _data) => {
        if(_err){
          httpMsg.show500(_req, _res, _err);
        } else {
          if(_data && _data.length > 0){
            httpMsg.sendJson(_req, _res, { status:true, message:"Success", data:_data[0] });
          } else {
            httpMsg.sendJson(_req, _res, { status:false, message:"Failed", data:{} });
          }
        }
      });
    }
  });

  // Insert or Update
  _app.post('/user',CT.ensureAuthorized, (_req, _res) => {
    const id = (_req.body.id)?_req.body.id:'';
    const user = {
      "name": (_req.body.name)?_req.body.name:'',
      "permission": (_req.body.permission)?_req.body.permission:'',
      "photo": (_req.body.photo)?_req.body.photo:'',
      "email": (_req.body.email)?_req.body.email:'',
      "password": (_req.body.password)?_req.body.password:'',
      "phone": (_req.body.phone)?_req.body.phone:'',
      "org_id": (_req.body.org_id)?_req.body.org_id:1,
      "phone": (_req.body.phone)?_req.body.phone:'',
      "inserted_by": (_req.body.inserted_by)?_req.body.inserted_by:1,
      "status": (_req.body.status)?_req.body.status:1,
      "ip" : CF.getIp(_req)
    }
    if(user.name =='' || user.email == '' || user.password == ''){
      return httpMsg.show400(_req, _res,"Parameter is missing","JSON");
    }
    let sql = '';
    let msg = '';
    if(id == ''){
      sql = "INSERT INTO users (`name`, `permission`, `photo`, `email`, `password`, `phone`, `org_id`, `inserted_on`, `inserted_by`, `status`, `ip`) VALUES ('"+user.name+"', '"+user.permission+"','"+user.photo+"','"+user.email+"','"+user.password+"', '"+user.phone+"', '"+user.org_id+"', now(), '"+_req.userData.id+"', '"+user.status+"', '"+user.ip+"')";
      msg = "Inserted Successfully";
      console.log("SQL: ", sql);
    }else{
      sql = "UPDATE users SET name = '"+_req.body.name+"', permission = '"+_req.body.permission+"', photo = '"+_req.body.photo+"', email = '"+_req.body.email+"',  password = '"+_req.body.password+"',  phone = '"+_req.body.phone+"',  org_id = '"+_req.body.org_id+"',  updated_on = now(),  updated_by = '"+_req.userData.id+"', status = '"+_req.body.status+"', ip = '"+_req.body.ip+"' WHERE id = '"+id+"'";
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

  _app.delete('/user/:id',CT.ensureAuthorized, (_req, _res) => {
    var id = (_req.params.id) ? _req.params.id : '';
    if(id == ''){
      httpMsg.show403(_req, _res, "Id is missing");
    } else {
      db.executeSql("UPDATE user SET status = -1, updated_on = now() WHERE id = '" + _req.userData.id + "'", (_err, _data) => {
        console.log('Status Updated', _data);
        if(_err){
          httpMsg.show500(_req, _res, _err);
        } else {
          httpMsg.sendJson(_req, _res, { status:true, message:"Deleted"});
        }
      });
    }
  });

  _app.get('/user/:id/status/:status', (_req, _res) => {
    const id = (_req.params.id) ? _req.params.id : '';
    const status = (_req.params.status) ? _req.params.status : 1;
    if(id == ''){
      httpMsg.show403(_req, _res, "Id is missing");
    } else {
      db.executeSql("UPDATE users SET status = '"+status+"', updated_on = now() WHERE id = '" + _req.params.id + "'", (_err, _data) => {
        console.log('Status Updated', _data);
        if(_err){
          httpMsg.show500(_req, _res, _err);
        } else {
          httpMsg.sendJson(_req, _res, { status:true, message: "Success" });
        }
      });
    }
  });
} 