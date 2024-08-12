module.exports = function makeSignup(db, bcrypt, jwt, E, utils) {
    return async function signup(req, res, next) {
        try {
            let { email, name, lastname, password, role, tel } = req.body;

            // Validate input fields
            if (!email || !name || !lastname || !password || !tel) {
                return next(new E.InvalidInputError("All fields are required"));
            }

            // Check if the user already exists
            let existingUser = await db.User.findOne({ email });
            if (existingUser) {
                return next(new E.UserExistsError("User already exists"));
            }

            let hashedPassword = await bcrypt.hash(password, 10);

            const user = new db.User({
                email,
                password: hashedPassword,
                name,
                lastname,
                verified: true, // Ensure the field is set to true
                role: role || 'user',
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

            await db.User.updateOne(
                { _id: result._id },
                {
                    $set: {
                        loginStamp: loginStamp,
                        lastActive: new Date()
                    }
                }
            );

            let response = {
                message: "Account created successfully",
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

            res.status(200).send(response);

        } catch (err) {
            next(err);
        }
    }
}
