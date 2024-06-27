const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const cookieparser = require('cookie-parser');
const flash = require('connect-flash'); 
const bodyParser = require('body-parser');
const expressSession = require('express-session');

const db = require('./config/mongoose-connection');
const index = require('./routes/index');
const userRouters = require('./routes/userRouters');
const manufacturerRouters = require('./routes/manufacturerRouters');
const retailerRouters = require('./routes/retailerRouters');
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieparser());
app.use(express.static(path.join(__dirname,"public")));
app.use(expressSession({
    resave:false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
}));

app.use('/',index);
app.use('/api/manufacturer',manufacturerRouters);
app.use('/api/retailer',retailerRouters);
app.use('/api/users',userRouters);

app.listen(3000);