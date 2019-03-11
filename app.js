const express = require('express');
const config = require('./config');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const multiParty = require('connect-multiparty'); 

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, }));
app.use(multiParty());


var cmsApi = express.Router();
require("./cms-api/config")(cmsApi);
app.use(cmsApi);

app.listen(config.port, () => console.log(`${config.dbConfig.database} listening on port ${config.port} Successfully`));
