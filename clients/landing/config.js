const landing = require('./controllers/landing');
module.exports = (_app) => {
  _app.get('/landing', landing.LandingController);
};