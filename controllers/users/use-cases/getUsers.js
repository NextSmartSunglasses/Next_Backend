module.exports = function makeGetUsers(db,E,utils) {
    return async function getProfile(req, res) {
        const users = await db.User.find({role:req.query.role});
        const result = []
        for(user of users) {
            result.push({
                id: user.id,
                role: user.role,
                email: user.email,
                name: user.name,
                lastname: user.lastname,
                verified: user.verified,
                tel: user.tel
            })
        }
        res.json(result);
    }
}