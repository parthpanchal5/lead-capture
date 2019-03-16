const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const CT = require('./../check-token');

module.exports = (_app) => {

  // All data
  _app.get('/user-groups', CT.ensureAuthorized, (_req, _res) => {
    var filterSql = (_req.query.name) ? ' AND name LIKE " % ' + _req.query.name + '%"' : '';
    db.executeSql("SELECT * FROM user_group WHERE NOT status = -1" +filterSql+ " ORDER BY inserted_on desc", (_err, _data) => {
      if(_err){
        httpMsg.show500(_req, _res, _err);
      } else {
        if(_data && _data.length > 0){
          httpMsg.sendJson(_req, _res, { status:true, message:"Successful", data:_data });
        } else {
          httpMsg.sendJson(_req, _res, { status:false, message:"Failed", data:[] });
        }
      }
    });
  });

  // Specific data
  _app.get('/user-group/:id', CT.ensureAuthorized, (_req, _res) => {
    var id = (_req.params.id) ? _req.params.id : '';
    if(id == ''){
      httpMsg.show403(_req, _res, "ID is missing");
    } else {
      db.executeSql("SELECT * FROM user_group WHERE id = '"+ _req.params.id +"'", (_err, _data) => {
        if(_err){
          httpMsg.show500(_req, _res, _err);
        } else {
          if(_data && _data.length > 0){
            httpMsg.sendJson(_req, _res, { status:true, message:"Successful", data:_data[0] });
          } else {
            httpMsg.sendJson(_req, _res, { status:false, message:"Fail", data:{} });
          }
        }
      });
    }
  });

  // Insert or Update
  _app.post('/user-group', CT.ensureAuthorized, (_req, _res) => {
    const id = (_req.body.id)?_req.body.id:'';
    const userGroup = {
      "name": (_req.body.name)?_req.body.name:'',
      "permission": (_req.body.permission)?_req.body.permission:'',
      "org_id": (_req.body.org_id)?_req.body.org_id:1,
      "status": (_req.body.status)?_req.body.status:1,
      "inserted_on": (_req.body.inserted_on)?_req.body.inserted_on:'',
      "updated_on": (_req.body.updated_on)?_req.body.updated_on:'',
      "inserted_by": (_req.body.inserted_by)?_req.body.inserted_by:'',
      "updated_by": (_req.body.updated_by)?_req.body.updated_by:1,
      "ip" : CF.getIp(_req)
    }
    if(userGroup.name == ''){
      httpMsg.show500(_req, _res, "hh");
    }
    let sql = '';
    let msg = '';
    if(id == ''){
      sql = "INSERT INTO user_group (`name`, `permission`, `org_id`, `inserted_on`, `updated_by`, `status`, `ip`) VALUES ('"+userGroup.name+"', '"+userGroup.permission+"', '"+userGroup.org_id+"', now(), "+userGroup.updated_by+", "+userGroup.status+", '"+userGroup.ip+"')";
      msg = "Inserted Successfully";
      console.log("SQL: ", sql);
    }else{
      sql = "UPDATE user_group SET name = '"+_req.body.name+"', permission = '"+_req.body.permission+"', org_id = '"+_req.body.org_id+"',  updated_by = '"+_req.body.updated_by+"', status = "+_req.body.status+", ip = '"+_req.body.ip+"' WHERE id = '"+id+"'";
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

  _app.delete('/user-group/:id', CT.ensureAuthorized, (_req, _res) => {
    var id = (_req.params.id) ? _req.params.id : '';
    if(id == ''){
      httpMsg.show403(_req, _res, "Id is missing");
    } else {
      db.executeSql("UPDATE user_group SET status = -1, updated_on = now() WHERE id = '" + _req.params.id + "'", (_err, _data) => {
        console.log('Status Updated', _data);
        if(_err){
          httpMsg.show500(_req, _res, _err);
        } else {
          httpMsg.sendJson(_req, _res, { status:true, message:"Deleted"});
        }
      });
    }
  });

  _app.get('/user-group/:id/status/:status', (_req, _res) => {
    const id = (_req.params.id) ? _req.params.id : '';
    const status = (_req.params.status) ? _req.params.status : 1;
    if(id == ''){
      httpMsg.show403(_req, _res, "Id is missing");
    } else {
      db.executeSql("UPDATE user_group SET status = '"+status+"', updated_on = now() WHERE id = '" + _req.params.id + "'", (_err, _data) => {
        console.log('Status Updated', _data);
        if(_err){
          httpMsg.show500(_req, _res, _err);
        } else {
          httpMsg.sendJson(_req, _res, { status:true, message: "Successful" });
        }
      });
    }
  });
} 