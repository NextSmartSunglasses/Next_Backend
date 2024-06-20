const db = require('../../../models')
const makeGetUsers = require('./getUsers')
let E = null,
	utils = null,
    usecases;
function init() {
    const getUsers = makeGetUsers(db,E,utils)
    usecases = Object.freeze({
        getUsers
    })
}


module.exports = function (U,errors) {
    utils = U;
	E = errors;
    init()
    return usecases
}
