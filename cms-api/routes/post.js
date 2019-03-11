const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const CT = require('./../check-token');

module.exports = (_app) => {

  // All data
  _app.get('/posts', CT.ensureAuthorized, (_req, _res) => {
    var filterSql = (_req.query.name) ? ' AND post_name LIKE " % ' + _req.query.name + '%"' : '';
    db.executeSql("SELECT * FROM posts WHERE NOT status = -1" +filterSql+ " ORDER BY inserted_on desc", (_err, _data) => {
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

  // Specific data
  _app.get('/post/:id', CT.ensureAuthorized, (_req, _res) => {
    var id = (_req.params.id) ? _req.params.id : '';
    if(id == ''){
      httpMsg.show403(_req, _res, "ID is missing");
    } else {
      db.executeSql("SELECT * FROM posts WHERE id = '"+ _req.params.id +"'", (_err, _data) => {
        if(_err){
          httpMsg.show500(_req, _res, _err);
        } else {
            if(_data && _data.length > 0){
              httpMsg.sendJson(_req, _res, { status:true, message:"Successful", data:_data[0] });
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
      "campaign_id": (_req.body.campaign_id)?_req.body.campaign_id:2,
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
    let sql = '';
    let msg = '';
    if(id == ''){
      sql = "INSERT INTO posts (`campaign_id`, `title`, `post_desc`, `posted_on`, `track_id`, `post_img_vid`, `post_type`, `post_content`, `remark`, `inserted_by`, `updated_by`, `status`, `ip`) VALUES ('"+post.campaign_id+"', '"+post.title+"','"+post.post_desc+"', now(),'"+post.track_id+"','"+post.post_img_vid+"','"+post.post_type+"','"+post.post_content+"','"+post.remark+"','"+post.inserted_by+"', '"+post.updated_by+"', '"+post.status+"', '"+post.ip+"')";
      msg = "Inserted Successfully";
      console.log("SQL: ", sql);
    }else{
      sql = "UPDATE posts SET campaign_id = '"+_req.body.campaign_id+"', title = '"+_req.body.title+"', post_desc = '"+_req.body.post_desc+"', posted_on = now(), track_id = "+_req.body.track_id+", post_img_vid = '"+_req.body.post_img_vid+"', post_type = '"+_req.body.post_type+"', post_content = '"+_req.body.post_content+"', remark = '"+_req.body.remark+"', status = "+_req.body.status+" WHERE id = "+_req.body.id+"";
      msg = "Updated Successfully";  
    }
    db.executeSql(sql, (_err, _data) => {
      if(_err){
        httpMsg.show500(_req, _res, _err, "JSON");
      } else {
        httpMsg.sendJson(_req, _res, { status: true, message:msg });
      }
    });
  });

} 