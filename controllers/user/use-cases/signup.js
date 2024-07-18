module.exports = function makeSignup(db, bcrypt, jwt, E, utils) {
    return async function signup(req, res, next) {
        try {
            let { email, name, lastname, verified, role, tel } = req.body;
            let boolVerified = String(verified) === "true";
            let password = await bcrypt.hash(req.body.password, 10);
            
            const user = new db.User({
                email,
                password,
                name,
                lastname,
                verified: boolVerified,
                role,
                tel,
            });
            const result = await user.save();

            let loginStamp = new Date().toISOString();

            const payload = {
                data: {
                    id: result._id,
                    name: result.name,
                    lastname: result.lastname,
                    email: result.email,
                    role: result.role,
                    createdAt: result.createdAt,
                    loginStamp: loginStamp,
                    tel: result.tel,
                }
            };

            var accessToken = jwt.sign(payload, process.env.SignKey, {
                expiresIn: "7d",
            });

            // Update loginStamp in the database
            await db.User.updateOne(
                { _id: result._id },
                {
                    $set: {
                        loginStamp: loginStamp,
                        lastActive: new Date()
                    }
                }
            );

            // Build the response
            let response = {
                token: accessToken,
                id: result._id,
                name: result.name,
                lastname: result.lastname,
                email: result.email,
                role: result.role,
                createdAt: result.createdAt,
                loginStamp: loginStamp,
                tel: result.tel
            };

            res.send(response);

            // Optional: Send verification email if not verified

        } catch (err) {
            next(err);
        }
    }
}
