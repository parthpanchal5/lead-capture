const httpMsg = require('../../../core/httpMsg');
const db = require('../../../core/db');
const CF = require('../../../core/commonFun');

exports.LandingController = (_req, _res, next) => {
	if(_req.query.trackid){
		let sql = "select id, track_id from posts where not status = -1 and not status = 0 and track_id = '"+_req.query.trackid+"'";
		db.executeSql(sql, (err,data) => {
			console.log(sql);
			if(err){
				httpMsg.sendJson(_req, _res, {message: 'Track id not found'});
			} else {
				console.log('Session id: ', _req.session);
				if(data && data.length>0){
					if(!CF.isset(_req.session.lead_id)){
						let sql1 = "insert into lead (post_id, browser, ip, status, inserted_on) values ('"+data[0].id+"','"+_req.headers["user-agent"]+"', '"+CF.getIp(_req)+"',1,now())";
						db.executeSql(sql1, (err1, data1) => {
							console.log("SQL 1: ",sql1);
							if(err1){
								httpMsg.show500(_req, _res, _err, "JSON");
							} else {
								lead_id = data1.insertId;
								_req.session.lead_id = data1.insertId;
								console.log('Id: ', data1.insertId);
								_res.render('landing/views/landing.html', {lead_id});	
							}
						});
					}else{
						_res.render('landing/views/landing.html', {lead_id});
					}
					
				} 
			}
		})
	} else {
		console.log('REQleadid: ', _req.session);
		if(!CF.isset(_req.session.lead_id)){

			let sql2 = "insert into lead (browser, ip, status, inserted_on) values ('"+_req.headers["user-agent"]+"', '"+CF.getIp(_req)+"',1,now())";
			db.executeSql(sql2, (err1, data1) => {
				console.log(sql2);
				
				if(err1){
					httpMsg.sendJson(_req, _res, {status: true, message: 'Fault Params'});
				} else {
					lead_id = data1.insertId;
					_req.session.lead_id = data1.insertId;
					console.log('req Id: ', data1.insertId);
					_res.render('landing/views/landing.html', {lead_id});
				}
			});
		}else{
			_res.render('landing/views/landing.html', {lead_id});
		}
	}
};

exports.LandingForm = (_req, _res, next) => {
	let sql = '';
	var landing = {
		"lead_id": (_req.body.lead_id)?_req.body.lead_id:'', 
		"name": (_req.body.name)?_req.body.name:'',
		"email": (_req.body.email)?_req.body.email:'',
		"phone": (_req.body.phone)?_req.body.phone:'',
		"message": (_req.body.message)?_req.body.message:'',
		"status": (_req.body.status)?_req.body.status:1,
		"ip": CF.getIp(_req)
	};

	if(landing.name == '' || landing.email == '') {
		return httpMsg.sendJson(_req, _res, {status: false, message: 'Paramater missing'});
	} else if(landing.lead_id == '') {
		sql = "INSERT INTO enquiry (name, email, phone, message, status, inserted_on, ip) VALUES ("+landing.name+"', '"+landing.email+"', '"+landing.phone+"','"+landing.message+"', '"+landing.status+"', now(),'"+landing.ip+"')";
	} else {
		sql = "INSERT INTO enquiry (lead_id, name, email, phone, message, status, inserted_on, ip) VALUES ('"+landing.lead_id+"' ,'"+landing.name+"', '"+landing.email+"', '"+landing.phone+"','"+landing.message+"', '"+landing.status+"', now(), '"+landing.ip+"')";
	}
	db.executeSql(sql, (_err, _data) => {
		console.log('SQL: ', sql);
		if(_err) {
			httpMsg.show500(_req, _res, _err, "JSON");
		} else {
			var data = {
				type:"Enquiry",
				domain:_req.protocol+"//"+_req.hostname,
				message:"<table border='1' style='width:100%;'><thead><tr><th colspan='2'>Enquery</th></tr></thead><tbody><tr><th>Name</th><td>"+landing.name+"</td></tr><tr><th>Email</th><td>"+landing.email+"</td></tr><tr><th>Message</th><td>"+landing.message+"</td></tr><tr><th>IP</th><td>"+landing.ip+"</td></tr></tbody></table>"
			}
			httpMsg.sendJson(_req, _res, {status: true, message: '<strong>Your message sent </strong>'});
		}
	});

};