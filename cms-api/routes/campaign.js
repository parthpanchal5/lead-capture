const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const CT = require('./../check-token');
const SW = require('sync-watch');

module.exports = (_app) => {

  // Get all campaigns
  _app.get('/campaigns', CT.ensureAuthorized, (_req, _res) => {

    result = {};
    result.page = parseInt(CF.isset(_req.query.page)?_req.query.page:1);
    result.limit = parseInt(CF.isset(_req.query.limit)?_req.query.limit:10);
    var skip = (result.page-1)* result.limit;
    var SQLLimit = skip + ',' + result.limit;

    var filterSql = (_req.query.title) ? ' and c.title LIKE "%' + _req.query.title + '%"' : '';
    filterSql += (_req.query.org_id) ? ' and c.org_id = "' + _req.query.org_id + '"' : '';
    db.executeSql("SELECT count(c.id) AS total FROM campaign AS c WHERE NOT c.status= -1"+ filterSql,(_errT,_dataT) => {
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
        // console.log("SELECT c.* FROM campaign AS c where not c.status=0 and not c.status=-1"+filterSql+" limit " +SQLLimit);
        db.executeSql("SELECT c.*, (SELECT COUNT(p.id) FROM posts AS p WHERE NOT p.status = -1 AND NOT p.status = 0 AND p.campaign_id = c.id) AS posts FROM campaign as c where not c.status = -1"+filterSql+" order by c.inserted_on desc limit " +SQLLimit, (_err, _data) => {
          if(_err) {
            httpMsg.show500(_req, _res, _err);
          } else {
              if(_data && _data.length > 0) {
                result.docs = _data;
              } else {
                result.docs = [];
              }
            httpMsg.sendJson(_req, _res, { status: true, message: 'Successful', data:result });
          }
        });
      }
    });
  });

  // For Drop-down and updating results
  _app.get('/campaign/:id', CT.ensureAuthorized, (_req, _res) => {
    var sw = new SW();
    var result = {};
    var id = (_req.params.id) ? _req.params.id : '0';
    if(id == '0') {
      result.campaign = {};
    } else {
      sw.Sync("campaign", (_rcb) => db.executeSql("SELECT * FROM campaign WHERE id = '" + _req.params.id + "'", _rcb), (_err, _data) => {
        if(!_err){
          if(_data && _data.length > 0){
            result.campaign = _data[0];
          } else {
            result.campaign = {};
          }
          return true;
        } 
      }); 
    }
    sw.Sync("orgdrop", (_rcb) => db.executeSql("SELECT id, org_name FROM organization WHERE NOT status = -1 OR NOT status = 0", _rcb), (_err, _data) => {
      if(!_err) {
        if(_data && _data.length > 0) {
          result.organizations = _data;
        } else {
          result.organizations = [];
        }
        return true;
      }
    });
    sw.Watch((_err) => {
      if(!_err) {
        httpMsg.sendJson(_req, _res, {status: true, message: 'Successfully Displayed', data: result});
      } else {
        httpMsg.show500(_req, _res, _err, "JSON");
      }
    });
  });
  

  // Insert or update into Campaign
  _app.post('/campaign', CT.ensureAuthorized, (_req, _res) => {
    const id = (_req.body.id)?_req.body.id:'';
    const camp = {
      "title" : (_req.body.title)?_req.body.title:'',
      "camp_desc" : (_req.body.camp_desc)?_req.body.camp_desc:'',
      "landing_page_url" : (_req.body.landing_page_url)?_req.body.landing_page_url:'',
      "remark" : (_req.body.remark)?_req.body.remark:'',
      "inserted_by" : (_req.body.inserted_by)?_req.body.inserted_by:1,
      "updated_by": (_req.body.updated_by) ? _req.body.updated_by:1,
      "status":(_req.body.status) ? _req.body.status:1,
      "ip" : CF.getIp(_req)
    }
    let sql = '';
    let msg = '';
    if(id == ''){
      sql = "INSERT INTO campaign (title, camp_desc, landing_page_url, remark, inserted_on, inserted_by, updated_by, ip, status) VALUES ('"+camp.title+"', '"+camp.camp_desc+"', '"+camp.landing_page_url+"', '"+camp.remark+"', now(),'"+camp.inserted_by+"', '"+camp.updated_by+"','"+camp.ip+"', '"+camp.status+"')";
      msg = "Successfully Inserted";
      console.log('SQL', sql);
    }else{
      sql = "UPDATE campaign SET title = '"+camp.title+"', camp_desc = '"+camp.camp_desc+"', landing_page_url = '"+camp.landing_page_url+"', remark = '"+camp.remark+"', inserted_on = now(), inserted_by = '"+camp.inserted_by+"', updated_by = '"+camp.updated_by+"' WHERE id = '"+_req.body.id+"'";
      msg = "Successfully Updated";
      console.log('SQL', sql);
 
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