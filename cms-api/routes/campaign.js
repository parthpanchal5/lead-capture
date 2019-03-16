const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const CT = require('./../check-token');

module.exports = (_app) => {

  // Get all campaigns
  _app.get('/campaigns', CT.ensureAuthorized, (_req, _res) => {
    var filterSql = (_req.query.name) ? ' WHERE campaign_name LIKE "%' + _req.query.name + '%"' : '';
    db.executeSql("SELECT * FROM campaign WHERE NOT status = -1"+ filterSql,(_err,_data) => {
      if(_err){
        httpMsg.show500(_req, _res, _err);
      } else {
        if(_data && _data.length > 0){
          httpMsg.sendJson(_req, _res, { status:true, message:"Successfully", data: _data });
        } else {
          httpMsg.sendJson(_req, _res, { status:false, message:"Fail", data:[] });
        }
      }
    });
  });

  // Get specific campaign
  _app.get('/campaign/:id', CT.ensureAuthorized, (_req, _res) => {
    var id = (_req.params.id) ? _req.params.id : '';
    if(id == ''){
      httpMsg.show403(_req, _res, "Id is missing");
    } else {
      db.executeSql("SELECT * FROM campaign where id = '" + _req.params.id + "'", (_err, _data) => {
        if(_err){
          httpMsg.show500(_req, _res, _err);
        } else {
          if(_data && _data.length > 0){
            httpMsg.sendJson(_req, _res, { status:true, message:"Successfully", data:_data[0] });
          } else {
            httpMsg.sendJson(_req, _res, { status:false, message:"Fail", data:{} });
          }
        }
      });
    }
  });

  // Insert or update into Campaign
  _app.post('/campaign', CT.ensureAuthorized, (_req, _res) => {
    const id = (_req.body.id)?_req.body.id:'';
    const camp = {
      "title" : (_req.body.title)?_req.body.title:'',
      "desc" : (_req.body.desc)?_req.body.desc:'',
      "landing_page_url" : (_req.body.landing_page_url)?_req.body.landing_page_url:'http://parthpanchal5.github.io',
      "remark" : (_req.body.remark)?_req.body.remark:'',
      "inserted_by" : (_req.body.inserted_by)?_req.body.inserted_by:1,
      "updated_by": (_req.body.updated_by) ? _req.body.updated_by:1,
      "status":(_req.body.status) ? _req.body.status:1,
      "ip" : CF.getIp(_req)
    }
    let sql = '';
    let msg = '';
    if(id == ''){
      sql = "INSERT INTO campaign (title, camp_desc, landing_page_url, remark, inserted_on, inserted_by, updated_by, ip, status) VALUES ('"+camp.title+"', '"+camp.desc+"', '"+camp.landing_page_url+"','"+camp.remark+"', now(),'"+camp.inserted_by+"', '"+camp.updated_by+"','"+camp.ip+"', '"+camp.status+"')";
      msg = "Successfully Inserted";
      console.log('SQL', sql);
    }else{
      sql = "UPDATE campaign SET title = '"+camp.title+"', camp_desc = '"+camp.desc+"', landing_page_url = '"+camp.landing_page_url+"', remark = '"+camp.remark+"', inserted_on = now(), inserted_by = '"+camp.inserted_by+"', updated_by = '"+camp.updated_by+"' WHERE id = '"+_req.body.id+"'";
      msg = "Successfully Updated";
    }
    db.executeSql(sql, (_err, _data) => {
      if(_err){
        httpMsg.show500(_req, _res, _err, "JSON");
      }else{
        httpMsg.sendJson(_req, _res, { status: true, message:msg });
      }
    })
  });

  // Delete specific record with id
  _app.delete('/campaign/:id', CT.ensureAuthorized, (_req, _res) => {
    var id = (_req.params.id) ? _req.params.id : '';
    if(id == ''){
      httpMsg.show403(_req, _res, "Id is missing");
    } else {
      db.executeSql("UPDATE campaign SET status = -1, updated_on = now() WHERE id = '" + _req.params.id + "'", (_err, _data) => {
        console.log('Status Updated', _data);
        if(_err){
          httpMsg.show500(_req, _res, _err);
        } else {
          httpMsg.sendJson(_req, _res, { status:true, message:"Successfully"});
        }
      });
    }
  });

  _app.get('/campaign/:id/status/:status', (_req, _res) => {
    const id = (_req.params.id) ? _req.params.id : '';
    const status = (_req.params.status) ? _req.params.status : 1;
    if(id == ''){
      httpMsg.show403(_req, _res, "Id is missing");
    } else {
      db.executeSql("UPDATE campaign SET status = '"+status+"', updated_on = now() WHERE id = '" + _req.params.id + "'", (_err, _data) => {
        console.log('Status Updated', _data);
        if(_err){
          httpMsg.show500(_req, _res, _err);
        } else {
          httpMsg.sendJson(_req, _res, { status:true, message: "Successfully" });
        }
      });
    }
  });
}