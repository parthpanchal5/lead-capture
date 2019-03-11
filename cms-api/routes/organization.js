const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const CT = require("./../check-token");

module.exports = (_app) => {

  // All Data
  _app.get('/organizations', CT.ensureAuthorized, (_req, _res) => {
    var filterSql = (_req.query.name) ? ' and org_name LIKE "% ' + _req.query.name + '%"' : '';
    db.executeSql("SELECT * FROM organization where not status = -1" + filterSql+" order by inserted_on desc", (_err,_data) => {
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

  // Specific data with id
  _app.get('/organization/:id', CT.ensureAuthorized, (_req, _res) => {
    var id = (_req.params.id) ? _req.params.id : '';
    if(id == ''){
      httpMsg.show403(_req, _res, "Id is missing");
    } else {
      db.executeSql("SELECT * FROM organization WHERE id = '" + _req.params.id + "'", (_err, _data) => {
        if(_err){
          httpMsg.show500(_req, _res, _err);
        } else {
          if(_data && _data.length > 0){
            httpMsg.sendJson(_req, _res, { status:true, message:"Successful", data:_data[0] });
          } else {
            httpMsg.sendJson(_req, _res, { status:false, message:"Failed", data:{ } });
          }
        }
      });
    }
  });

  // Insert in table
  _app.post('/organization', CT.ensureAuthorized,(_req, _res) => {
    const id = (_req.body.id)?_req.body.id:'';
    const org = {
      "org_name" : (_req.body.org_name)?_req.body.org_name:'',
      "org_desc" : (_req.body.org_desc)?_req.body.org_desc:'',
      "admin_id" : (_req.body.admin_id)?_req.body.admin_id:0,
      "admins_id" : (_req.body.admins_id)?_req.body.admins_id:1,
      "status" : (_req.body.status)?_req.body.status:1,
      "ip" : CF.getIp(_req)
    }
    let sql = '';
    let msg = '';
    if(id==''){
      sql = "INSERT INTO organization (org_name, org_desc, admin_id, admins_id, status, inserted_on, ip) VALUES ('"+org.org_name+"', '"+org.org_desc+"', '"+org.admin_id+"','"+org.admins_id+"', '"+org.status+"', now(),'"+org.ip+"')";
      msg = "Inserted Successfully";
    } else {
      sql = "UPDATE organization SET org_name = '"+org.org_name+"', org_desc = '"+org.org_desc+"', admin_id = '"+org.admin_id+"', admins_id = '"+org.admins_id+"', status = '"+org.status+"', updated_on = now(), ip = '"+org.ip+"' WHERE id  = '"+id+"'";
      msg = "Updated Successfully";
    }
    db.executeSql(sql, (_err, _data) => {
      if(_err){
        httpMsg.show500(_req, _res, _err, "JSON");
      }else{
        httpMsg.sendJson(_req, _res, { status:true, message:msg });
      }
    });
  });

  // Delete specific record with id
  _app.delete('/organization/:id', CT.ensureAuthorized, (_req, _res) => {
    var id = (_req.params.id) ? _req.params.id : '';
    if(id == ''){
      httpMsg.show403(_req, _res, "Id is missing");
    } else {
      db.executeSql("UPDATE organization SET status = -1, updated_on = now() WHERE id = '" + _req.params.id + "'", (_err, _data) => {
        console.log('Status Updated', _data);
        if(_err){
          httpMsg.show500(_req, _res, _err);
        } else {
          httpMsg.sendJson(_req, _res, { status:true, message:"Successful"});
        }
      });
    }
  });

  
  _app.put('/organization/:id/status/:status', (_req, _res) => {
    const id = (_req.params.id) ? _req.params.id : '';
    const status = (_req.params.status) ? _req.params.status : 1;
    if(id == ''){
      httpMsg.show403(_req, _res, "Id is missing");
    } else {
      db.executeSql("UPDATE organization SET status = '"+status+"', updated_on = now() WHERE id = '" + _req.params.id + "'", (_err, _data) => {
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
