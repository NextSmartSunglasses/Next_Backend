module.exports = function makeSignin(db, bcrypt, jwt, E, utils) {
    return async function signin(req, res, next) {
        try {
            let { email, password } = req.body;
            console.log(email, password);

            let foundUser = await db.User.findOne({ email });
            console.log("FOUND USER", foundUser);

            let incorrectCredentials = new E.NotFoundError("Incorrect Credentials");

            // User exists check
            if (!foundUser) {
                throw incorrectCredentials;
            }

            if (!foundUser.verified) {
                throw new E.UserNotAuthenticated("user is NOT verified");
            }

            let match = await bcrypt.compare(password, foundUser.password);

            // Password match check
            if (!match) {
                throw incorrectCredentials;
            }

            let loginStamp = new Date().toISOString();

            const payload = {
                id: foundUser.id,
                name: foundUser.name,
                lastname: foundUser.lastname,
                email: foundUser.email,
                role: foundUser.role,
                createdAt: foundUser.createdAt,
                loginStamp: loginStamp,
                tel: foundUser.tel
            };

            var accessToken = jwt.sign({ data: payload }, process.env.SignKey, {
                expiresIn: "7d",
            });

            await db.User.updateOne(
                { _id: foundUser.id },
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
                ...payload,
            };

            res.send(response);

        } catch (err) {
            next(err);
        }
    }
}
