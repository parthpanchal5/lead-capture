const express = require('express');
const config = require('./config');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const multiParty = require('connect-multiparty'); 
const ejs = require('ejs');
const app = express();
const session = require('express-session');
var cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, }));
app.use(multiParty());
app.use("/", express.static(path.join(__dirname, 'public')));

// Template engine
app.set('views', path.join(__dirname, 'clients'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    // if ('OPTIONS' == req.method){
    //     return res.send(200);
    // }
    next();
});

// Session
app.use(session ({
    secret: 'lol',
    resave: false,
    saveUninitialized: false,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}))

// Folder Redirection for ejs template engine
const clients = express.Router();
require('./clients/config')(clients);
app.use(clients);

var cmsApi = express.Router();
require("./cms-api/config")(cmsApi);

app.use('/cms-api', cmsApi);

app.listen(config.port, () => console.log(`${config.dbConfig.database} listening on port ${config.port} Successfully`));
