var express = require("express");

let U,
	E,
	M = null;

var router = express.Router();


function init() {
	// router.use(middlewares.jsonverify);
	router.use("/profile", M.jsonverify, require("./profile").router(U, E, M));
	router.use("/user", require("./user").router(U,E,M))
	router.use("/users", require("./users").router(U,E,M))
	router.use("/payment", require('./payment').router(U,E,M))
    router.use("/", require('./photo/photoRoutes'));  // Correct path

	
}

module.exports = function (utils, errors, middlewares) {
	U = utils;
	E = errors;
	M = middlewares(U,E);
	init();
	return router;
};