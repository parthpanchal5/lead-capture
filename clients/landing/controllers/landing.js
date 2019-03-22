const httpMsg = require('../../../core/httpMsg');
const db = require('../../../core/db');
const CF = require('../../../core/commonFun');

exports.LandingController = (_req, _res, next) => {
	if(_req.query.trackid){
		db.executeSql("select id from posts where not status = -1 and not status = 0 and track_id = '"+_req.query.trackid+"'", (err,data) => {
			if(err){

			} else {
				if(data && data.length>0){
					db.executeSql("insert into lead (post_id, browser, ip, status, inserted_on) values('"+data[0].id+"','"+_req.headers["user-agent"]+"', '"+CF.getIp(_req)+"',0,now())", (err1, data1) => {
						if(err1){

						} else {
							_res.render('landing/views/landing.html');
						}
					})
				} else {
					_res.render('landing/views/landing.html');
				}

			}
		})
	} else {
		_res.render('landing/views/landing.html');
	}
};