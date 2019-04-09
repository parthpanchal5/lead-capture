const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const CT = require('./../check-token');

module.exports = (_app) => {
	_app.get('/campaign-chart/:id', CT.ensureAuthorized, (_req, _res) => {
		var sql1 = "Select p.title, (select count(l.id) from lead as l where l.post_id = p.id AND NOT l.status = -1) as leads, (select count(e.id) from enquiry as e inner join lead as l1 on l1.id = e.lead_id where l1.post_id = p.id AND NOT e.status = -1) as enquires from posts as p where p.campaign_id = '"+_req.params.id+"' AND NOT p.status = -1";
		console.log("sql : ",sql1)
    db.executeSql(sql1,(_err, _data) => {
      if(_err){  
        httpMsg.show500(_req, _res, _err);
      } else{
          if(_data && _data.length > 0) {
            httpMsg.sendJson(_req, _res, { status: true, message: 'Success', data:_data });
          } else {
            httpMsg.sendJson(_req, _res, { status: true, message: 'Success', data:[] });
          }
        
      }
    });
	});
}