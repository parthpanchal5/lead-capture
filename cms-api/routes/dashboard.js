const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const CT = require('./../check-token');

module.exports = (_app) => {
	 _app.get('/dashboard', CT.ensureAuthorized, (_req, _res) => {
    let sql = "SELECT (SELECT COUNT(o.id) FROM organization as o) as orgCount, (SELECT COUNT(c.id) FROM campaign as c) as campCount, (SELECT COUNT(p.id) FROM posts as p) as postCount";
    var result = {};
    db.executeSql(sql, (_err, _data) => {
      if(_err) { 
        httpMsg.show500(_req, _res, _err, "JSON");
       } else{
        if(_data && _data.length > 0) {
          httpMsg.sendJson(_req, _res, {status: true, message: 'Success', data: _data[0]});
        } else {
          httpMsg.sendJson(_req, _res, {status: true, message: 'Fail', data: {}});
        }
      }
    });
  });
}