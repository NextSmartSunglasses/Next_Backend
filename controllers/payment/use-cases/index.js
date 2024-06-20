const db = require('../../../models')
const makeAddPayment = require('./addPayment')
const makeVerifyPayment = require('./verifyPayment')
let E = null,
	utils = null,
    usecases;
function init() {
    const addPayment = makeAddPayment(db,E,utils)
    const verifyPayment = makeVerifyPayment(db,E,utils)
    usecases = Object.freeze({
        addPayment,
        verifyPayment,
    })
}


module.exports = function (U,errors) {
    utils = U;
	E = errors;
    init()
    return usecases
}
