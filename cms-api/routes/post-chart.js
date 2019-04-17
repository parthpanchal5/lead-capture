const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const CT = require('./../check-token');
const SW = require('sync-watch');

module.exports = (_app) => {
	// For Posts Chart
	let result = {};
	const sw = new SW();
	_app.get('/post-chart/:id', CT.ensureAuthorized, (_req, _res) => {
    sw.Sync("leadCount",(rcb) => {db.executeSql("SELECT COUNT(l.id) as leads, DATE_FORMAT(l.inserted_on, '%d-%M-%y') as inDate FROM `lead` as l WHERE l.post_id = '"+_req.params.id+ "' group BY DATE_FORMAT(l.inserted_on, '%d-%M-%y')", rcb)},(_err, _data) => {
      if(!_err){
				if(_data && _data.length > 0) {
					// console.log("date lead : ",_data);
					result.leads = _data;
				} else {
					result.leads= [];
				}
				return true;
			}
		});

		sw.Sync("enquiryCount",(rcb) => {db.executeSql("SELECT COUNT(e.id) as enquiries, DATE_FORMAT(e.inserted_on, '%d-%M-%y') as inDate FROM `enquiry` as e INNER JOIN lead as l1 on l1.id = e.lead_id WHERE l1.post_id = '"+_req.params.id+"' group BY DATE_FORMAT(e.inserted_on, '%d-%M-%y')", rcb)},(_err, _data) => {
      if(!_err){
				if(_data && _data.length > 0) {
					// console.log("date enquiry : ",_data);
					result.enquiries = _data;
				} else {
					result.enquiries= [];
				}
				return true;
			}
		});
		 
		sw.Watch((_err) => {
			if(_err){  
        httpMsg.show500(_req, _res, _err);
      } else{
				let tempData = {};
				for(var l in result.leads){
					if(tempData[result.leads[l].inDate]){
						tempData[result.leads[l].inDate].leads+=result.leads[l].leads;
					} else {
						tempData[result.leads[l].inDate]={
							enquiries:0,
							leads: result.leads[l].leads
						};
					}
				}
				for(var l in result.enquiries){
					if(tempData[result.enquiries[l].inDate]){
						tempData[result.enquiries[l].inDate].enquiries+=result.enquiries[l].enquiries;
					} else {
						tempData[result.enquiries[l].inDate]={
							leads: 0,
							enquiries: result.enquiries[l].enquiries
						};
					}
				}
				// console.log("date : ",tempData);
				httpMsg.sendJson(_req, _res, { status: true, message: 'Success', data:tempData });
			}
		})
	});
}
