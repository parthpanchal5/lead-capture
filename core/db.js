const mysql = require("mysql");
const config = require("./../config");

exports.executeSql = (_sql, _callback) => {
  const conn = new mysql.createConnection(config.dbConfig);
  conn.connect((_err)=>{
      if(_err){
        conn.end();
        _callback(_err, null);
      } else {
        conn.query(_sql,(_err, _recordset) => {
          conn.end();
          if(_err){
            _callback(_err, null);
          } else {
            _callback(null, _recordset);
          }
        });
      }
  });
};