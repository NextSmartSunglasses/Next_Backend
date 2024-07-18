module.exports = function makeSignin(db, bcrypt, jwt, E, utils) {
    return async function signin(req, res, next) {
        try {
            let { email, password } = req.body;
            console.log("Signin request received for email:", email);

            let foundUser = await db.User.findOne({ email });
            console.log("FOUND USER:", JSON.stringify(foundUser, null, 2));

            let incorrectCredentials = new E.NotFoundError("Incorrect Credentials");

            // User exists check
            if (!foundUser) {
                console.log("User not found for email:", email);
                throw incorrectCredentials;
            }

            if (!foundUser.verified) {
                console.log("User not verified:", foundUser._id);
                throw new E.UserNotAuthenticated("user is NOT verified");
            }

            let match = await bcrypt.compare(password, foundUser.password);

            // Password match check
            if (!match) {
                console.log("Password mismatch for user:", foundUser._id);
                throw incorrectCredentials;
            }

            const payload = {
                data: {
                    id: foundUser._id,
                    name: foundUser.name,
                    lastname: foundUser.lastname,
                    email: foundUser.email,
                    role: foundUser.role,
                    createdAt: foundUser.createdAt,
                    tel: foundUser.tel
                }
            };

            var accessToken = jwt.sign(payload, process.env.SignKey, {
                expiresIn: "7d",
            });

            await db.User.updateOne(
                { _id: foundUser._id },
                {
                    $set: {
                        lastActive: new Date()
                    }
                }
            );

            // Build the response
            let response = {
                token: accessToken,
                ...payload.data,
            };

            console.log("Signin response:", JSON.stringify(response, null, 2));
            res.send(response);

        } catch (err) {
            console.error("Signin error:", err);
            next(err);
        }
    }
}
