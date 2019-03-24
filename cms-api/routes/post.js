const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const CT = require('./../check-token');
const SW = require('sync-watch');

module.exports = (_app) => {

	// All data
	_app.get('/posts', CT.ensureAuthorized, (_req, _res) => {
		result = {};
		result.page = parseInt(CF.isset(_req.query.page)?_req.query.page:1);
    result.limit = parseInt(CF.isset(_req.query.limit)?_req.query.limit:10);
    var skip = (result.page-1)* result.limit;
    var SQLLimit = skip + ',' + result.limit;

		var filterSql = (_req.query.title) ? ' and p.title LIKE "% ' + _req.query.title + '%"' : '';
    filterSql += (_req.query.org_id) ? ' and p.org_id = "' + _req.query.org_id + '"' : '';

		db.executeSql("SELECT count(p.id) AS total FROM posts AS p WHERE NOT p.status= -1"+ filterSql, (_errT, _dataT) => {
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
				console.log("SELECT p.* FROM posts AS p where not p.status=0 and not p.status=-1"+filterSql+" limit " +SQLLimit)
        db.executeSql("SELECT p.* FROM posts AS p where not p.status=0 and not p.status=-1"+filterSql+" limit " +SQLLimit, (_err, _data) => {
        	if(_err) {
            httpMsg.show500(_req, _res, _err);
          } else {
          	 if(_data && _data.length > 0) {
              result.docs = _data;
              // console.log(result.docs);
            } else {
            	result.docs = [];
            }
            httpMsg.sendJson(_req, _res, { status: true, message: 'Successfully', data:result });
          }
        });
			}
		});
	});

	// For Drop-down and updating results
	_app.get('/post/:id', CT.ensureAuthorized, (_req, _res) => {
		var sw = new SW();
    var result = {};		
		var id = (_req.params.id) ? _req.params.id : '0';
		if(id == '0') {
      result.post = {};
		} else {
			sw.Sync("post", (_rcb) => 	db.executeSql("SELECT * FROM posts WHERE id = '"+ _req.params.id +"'", _rcb), (_err, _data) => {
				if(!_err){
          if(_data && _data.length > 0){
						result.post = _data[0];
					} else {
						result.post = {};
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
		sw.Sync("campdrop", (_rcb) => db.executeSql("SELECT id, title FROM campaign WHERE NOT status = -1 OR NOT status = 0", _rcb), (_err, _data) => {
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

	// get data for copy link
	_app.get('/post-link/:id', CT.ensureAuthorized, (_req, _res) => {
		var id = (_req.params.id) ? _req.params.id : '';
		if(id == ''){
			httpMsg.show403(_req, _res, "ID is missing");
		} else {
			db.executeSql("SELECT p.track_id, c.landing_page_url FROM posts as p inner join campaign as c on c.id = p.campaign_id WHERE p.id = '"+ _req.params.id +"'", (_err, _data) => {
				if(_err){
					httpMsg.show500(_req, _res, _err);
				} else {
						if(_data && _data.length > 0){
							let trackingUrl = '';
							if(_data[0].landing_page_url.indexOf("?")<=-1){
								trackingUrl = _data[0].landing_page_url+'?trackid='+_data[0].track_id
							} else {
								trackingUrl = _data[0].landing_page_url+'&trackid='+_data[0].track_id
							}
							httpMsg.sendJson(_req, _res, { status:true, message:"Successfully", data:trackingUrl });
						} else {
							httpMsg.sendJson(_req, _res, { status:false, message:"Fail", data:{} });
						}
					}
			});
		}
	});

	// Insert or Update
	_app.post('/post', CT.ensureAuthorized, (_req, _res) => {
		const id = (_req.body.id)?_req.body.id:'';
		const post = {
			"campaign_id": (_req.body.campaign_id)?_req.body.campaign_id:1,
			"title": (_req.body.title)?_req.body.title:'',
			"post_desc": (_req.body.post_desc)?_req.body.post_desc:'',
			"posted_on": (_req.body.posted_on)?_req.body.posted_on:'',
			"track_id": (_req.body.track_id)?_req.body.track_id:'',
			"post_img_vid": (_req.body.post_img_vid)?_req.body.post_img_vid:'',
			"post_type": (_req.body.post_type)?_req.body.post_type:'',
			"post_content": (_req.body.post_content)?_req.body.post_content:'',
			"remark": (_req.body.remark)?_req.body.remark:'',
			"inserted_by": (_req.body.inserted_by)?_req.body.inserted_by:1,
			"updated_by": (_req.body.updated_by)?_req.body.updated_by:1,
			"status": (_req.body.status)?_req.body.status:1,
			"ip" : CF.getIp(_req)
		}
		let filter = (id!='') ? (" and not id = '"+id+"'") : '';
		db.executeSql("select id from posts where not status = -1 and track_id = '"+post.track_id+"'"+filter,(_cerr,_cdata) => {
			if(_cerr){
				httpMsg.show500(_req, _res, _cerr, "JSON");
			} else {
				if( _cdata && _cdata.length > 0) {
					httpMsg.sendJson(_req, _res, { status: false, message:"fail" });
				} else {
					let sql = '';
					let msg = '';
					if(id == ''){
						sql = "INSERT INTO posts (`campaign_id`, `title`, `post_desc`, `posted_on`, `track_id`, `post_img_vid`, `post_type`, `post_content`, `remark`, `inserted_by`, `updated_by`, `status`, `ip`) VALUES ('"+post.campaign_id+"', '"+post.title+"','"+post.post_desc+"', now(),'"+post.track_id+"','"+post.post_img_vid+"','"+post.post_type+"','"+post.post_content+"','"+post.remark+"','"+post.inserted_by+"', '"+post.updated_by+"', '"+post.status+"', '"+post.ip+"')";
						msg = "Inserted Successfully";
						console.log("SQL: ", sql);
					}else{
						sql = "UPDATE posts SET title = '"+_req.body.title+"', post_desc = '"+_req.body.post_desc+"', posted_on = now(), post_type = '"+_req.body.post_type+"', post_content = '"+_req.body.post_content+"', remark = '"+_req.body.remark+"', track_id = '"+_req.body.track_id+"' WHERE id  = '"+id+"'";
						msg = "Updated Successfully";  
						console.log("SQL: ", sql);

					}
					console.log('Sql: ', sql);
					db.executeSql(sql, (_err, _data) => {
						if(_err){
							httpMsg.show500(_req, _res, _err, "JSON");
						} else {
							httpMsg.sendJson(_req, _res, { status: true, message:msg });
						}
					});
				}
			}
		})
					
	});

	 // Delete specific record with id
	 _app.delete('/post/:id', CT.ensureAuthorized, (_req, _res) => {
    var id = (_req.params.id) ? _req.params.id : '';
    if(id == ''){
      httpMsg.show403(_req, _res, "Id is missing");
    } else {
      db.executeSql("UPDATE posts SET status = -1, updated_on = now() WHERE id = '" + _req.params.id + "'", (_err, _data) => {
        console.log('Status Updated', _data);
        if(_err){
          httpMsg.show500(_req, _res, _err);
        } else {
          httpMsg.sendJson(_req, _res, { status:true, message:"Successfully"});
        }
      });
    }
  });

	_app.get('/post/:id/status/:status', (_req, _res) => {
		const id = (_req.params.id) ? _req.params.id : '';
		const status = (_req.params.status) ? _req.params.status : 1;
		if(id == ''){
			httpMsg.show403(_req, _res, "Id is missing");
		} else {
			db.executeSql("UPDATE posts SET status = '"+status+"', updated_on = now() WHERE id = '" + _req.params.id + "'", (_err, _data) => {
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