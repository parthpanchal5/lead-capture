const httpMsg = require('./../../core/httpMsg');
const db = require("./../../core/db");
const CF = require('./../../core/commonFun');
const CT = require('./../check-token');

module.exports = (_app) => {
	_app.get('/camp-chart', CT.ensureAuthorized, (_req, _res) => {
		
	});
}