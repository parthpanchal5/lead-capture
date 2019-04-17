const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const CT = require("./../check-token");

module.exports = (_app) => {

  // All Data
  _app.get('/organizations', CT.ensureAuthorized, (_req, _res) => {

    result = {};
    result.page = parseInt(CF.isset(_req.query.page)?_req.query.page:1);
    result.limit = parseInt(CF.isset(_req.query.limit)?_req.query.limit:10);
    var skip = (result.page-1)* result.limit;
    var SQLLimit = skip + ',' + result.limit;

    var filterSql = (_req.query.name) ? ' and o.org_name LIKE "% ' + _req.query.name + '%"' : '';

    db.executeSql("SELECT count(o.id) as total FROM organization as o where not o.status = -1" + filterSql,(_errT, _dataT) => {
      if(_errT){
        httpMsg.show500(_req, _res, _errT);
      } else {
        if(_dataT && _dataT.length > 0){
          result.total = _dataT[0].total;
          result.pages = Math.ceil(result.total / result.limit);
        } else {
          result.total = 0;
          result.pages = 0; 
        }
        db.executeSql("SELECT o.*, (SELECT COUNT(c.id) FROM campaign AS c WHERE NOT c.status = -1 AND NOT c.status= 0 AND c.org_id = o.id) AS campaigns, (SELECT COUNT(p.id) FROM posts AS p WHERE NOT p.status = -1 AND NOT p.status = 0 AND p.org_id = o.id) AS posts FROM organization as o where not o.status = -1" + filterSql+" order by o.inserted_on desc limit " +SQLLimit, (_err,_data) => {
          if(_err){
            httpMsg.show500(_req, _res, _err);
          } else {
            if(_data && _data.length > 0){
              result.docs=_data;
            } else {
              result.docs=[];
            }
            httpMsg.sendJson(_req, _res, { status:true, message:"Success", data:result });
          }
        });
      }
    })
    
  });



  // Specific data with id
  _app.get('/organization/:id', CT.ensureAuthorized, (_req, _res) => {
    var result = {};
    var id = (_req.params.id) ? _req.params.id : '';
    if(id == ''){
      return httpMsg.show403(_req, _res, "Id is missing");
    } 
    db.executeSql("SELECT * FROM organization WHERE id = '" + _req.params.id + "'", (_err, _data) => {
      if(_err){ 
        httpMsg.show500(_req, _res, _err, "JSON");
      } else {
        if(_data && _data.length > 0){
          httpMsg.sendJson(_req, _res, {status: true, message: 'Successfully Displayed', data: _data[0]});
        } else {
          httpMsg.sendJson(_req, _res, {status: true, message: 'Successfully Displayed', data: {}});
        }
      } 
    }) 
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
          httpMsg.sendJson(_req, _res, { status:true, message:"Successfully"});
        }
      });
    }
  });

  
  _app.get('/organization/:id/status/:status', (_req, _res) => {
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
          httpMsg.sendJson(_req, _res, { status:true, message: "Success" });
        }
      });
    }
  });
}
