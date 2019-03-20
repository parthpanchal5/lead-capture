const httpMsg = require('../../../core/httpMsg');
const db = require('../../../core/db');

exports.LandingController = (_req, _res, next) => {
  _res.render('landing/views/landing.html');
};