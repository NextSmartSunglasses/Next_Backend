var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyLogger = require("morgan-body");
const cors = require("cors");
const jwt = require('jsonwebtoken'); // Ensure you have jwt package installed

const limiter = require('./config/limiter');
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });
require('./config/db');

if (process.env.NODE_ENV == "development") {
    //console.log(process.env);
}

let utils = require("./utils");
let errors = require("./errors");

const middlewares = require('./middlewares');
const db = require("./models"); // Add this line to import models
const makeJsonverify = require('./middlewares/jsonverify'); // Import the jsonverify middleware

var api = require("./controllers")(utils, errors, middlewares);

const photoRoutes = require('./controllers/photo/photoRoutes')(db, jwt, errors, utils); // Pass dependencies here

const app = express();

// Middleware setup
app.use(cors());
app.options("*", cors());
app.use(logger("dev"));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(limiter.IPLimiter);

// Routes setup
app.use("/s/api/", api);
app.use('/api', photoRoutes); // Using '/api' as the base path for the routes

app.get("/success", (req, res) => {
    res.json({
        message: "Payment Success"
    });
});

app.get("/fail", (req, res) => {
    res.json({
        message: "Payment Fail"
    });
});

app.use('/public/images', express.static(path.join(__dirname, 'public/images')));

app.listen(process.env.PORT || 4000, () => {
    console.log("PORT:", process.env.PORT || 4000);
});

module.exports = app;
