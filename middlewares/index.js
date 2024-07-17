
const makeJsonverify = require('./jsonverify')
const singleImage = require('./multer-confg.js')
const generateToken = require('./generateToken.js')

var jwt = require("jsonwebtoken");
const db = require('../models')


let E = null,
utils = null,
middlewares;

function init() {  
    const jsonverify = makeJsonverify(db,jwt,E,utils)
    
    middlewares = Object.freeze({
        jsonverify,
        generateToken,
        singleImage
    })
}


module.exports = function (U,errors) {
utils = U;
E = errors;
init()
return middlewares
}