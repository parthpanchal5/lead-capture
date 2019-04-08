const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const CT = require('./../check-token');

module.exports = (_app) => {

  // All data
  _app.get('/groups', CT.ensureAuthorized, (_req, _res) => {
    var filterSql = (_req.query.name) ? ' AND name LIKE " % ' + _req.query.name + '%"' : '';
    db.executeSql("SELECT * FROM group WHERE NOT status = -1" +filterSql+ " ORDER BY inserted_on desc", (_err, _data) => {
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
  _app.get('/group/:id', CT.ensureAuthorized, (_req, _res) => {
    var id = (_req.params.id) ? _req.params.id : '';
    if(id == ''){
      httpMsg.show403(_req, _res, "ID is missing");
    } else {
      db.executeSql("SELECT * FROM group WHERE id = '"+ _req.params.id +"'", (_err, _data) => {
        if(_err){
          httpMsg.show500(_req, _res, _err);
        } else {
          if(_data && _data.length > 0){
            httpMsg.sendJson(_req, _res, { status:true, message:"Success", data:_data[0] });
          } else {
            httpMsg.sendJson(_req, _res, { status:false, message:"Fail", data:{} });
          }
        }
      });
    }
  });

  // Insert or Update
  _app.post('/group', CT.ensureAuthorized, (_req, _res) => {
    const id = (_req.body.id)?_req.body.id:'';
    const group = {
      "name": (_req.body.name)?_req.body.name:'',
      "permission": (_req.body.permission)?_req.body.permission:'',
      "inserted_by": (_req.body.inserted_by)?_req.body.inserted_by:'',
      "updated_by": (_req.body.updated_by)?_req.body.updated_by:'',
      "status": (_req.body.status)?_req.body.status:'',
      "ip" : CF.getIp(_req)
    }
    let sql = '';
    let msg = '';
    if(id == ''){
      sql = "INSERT INTO group (`name`, `permission`, `status`, `inserted_by`, `updated_by`, `ip`) VALUES ('"+group.name+"', '"+group.permission+"','"+group.inserted_by+"','"+group.updated_by+"','"+group.status+"', '"+group.ip+"')";
      msg = "Inserted Successfully";
      console.log("SQL: ", sql);
    }else{
      sql = "UPDATE group SET name = '"+_req.body.name+"', permission = '"+_req.body.permission+"', inserted_by = '"+_req.body.inserted_by+"', updated_by = '"+_req.body.updated_by+"', status = '"+_req.body.status+"', ip = '"+_req.body.ip+"' WHERE id = '"+id+"'";
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

  _app.delete('/group/:id', CT.ensureAuthorized, (_req, _res) => {
    var id = (_req.params.id) ? _req.params.id : '';
    if(id == ''){
      httpMsg.show403(_req, _res, "Id is missing");
    } else {
      db.executeSql("UPDATE group SET status = -1, updated_on = now() WHERE id = '" + _req.params.id + "'", (_err, _data) => {
        console.log('Status Updated', _data);
        if(_err){
          httpMsg.show500(_req, _res, _err);
        } else {
          httpMsg.sendJson(_req, _res, { status:true, message:"Deleted"});
        }
      });
    }
  });


  _app.get('/group/:id/status/:status', (_req, _res) => {
    const id = (_req.params.id) ? _req.params.id : '';
    const status = (_req.params.status) ? _req.params.status : 1;
    if(id == ''){
      httpMsg.show403(_req, _res, "Id is missing");
    } else {
      db.executeSql("UPDATE group SET status = '"+status+"', updated_on = now() WHERE id = '" + _req.params.id + "'", (_err, _data) => {
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