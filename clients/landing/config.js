const landing = require('./controllers/landing');
module.exports = (_app) => {
  _app.get('/landing', landing.LandingController);
  _app.post('/landing', landing.LandingForm);
};