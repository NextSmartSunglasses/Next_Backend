module.exports = function makeGetProfile(db,E,utils) {
    return async function getProfile(req, res) {
        const user = await db.User.findById(req.user.id);
    
        user.password = undefined;
        res.json({
            id: user.id,
            role: user.role,
            email: user.email,
            name: user.name,
            lastname: user.lastname,
            verified: user.verified,
            tel: user.tel
        });
    }
}