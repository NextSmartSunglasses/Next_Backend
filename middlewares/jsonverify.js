const jwt = require('jsonwebtoken');

module.exports = function makeJsonverify(db, jwt, E, utils) {
    return async function jsonverify(req, res, next) {
        const bearerHeader = req.headers["authorization"];
        if (typeof bearerHeader !== "undefined") {
            const token = bearerHeader.split(" ")[1];

            try {
                var decoded = jwt.verify(token, process.env.SignKey); // Use TOKEN_SECRET

                // Log decoded token for debugging
                console.log("DECODED", decoded);

                const user = await db.User.findById(decoded.data.id); // Use decoded.id instead of decoded.data.id
                if (!user) {
                    throw new E.UserNotAuthenticated("token not valid");
                }

                // Check if the user is verified
                if (!user.verified) {
                    throw new E.UserNotAuthenticated("user not verified");
                }

                // Check if the loginStamp matches
                if (String(user.loginStamp) !== String(decoded.loginStamp)) {
                    console.log(String(user.loginStamp), String(decoded.loginStamp));
                    throw new E.UserNotAuthenticated("user connected on another device.");
                }

                // Remove password before attaching user to request
                delete user.password;
                req.user = user;
                console.log("USER:", user);

                // Update lastActive timestamp
                await db.User.updateOne(
                    { _id: decoded.id },
                    {
                        $set: {
                            lastActive: new Date(),
                        }
                    }
                );

                next();
            } catch (err) {
                err.status = 401;
                next(err);
            }
        } else {
            return next(new E.UserNotAuthenticated("token not supplied"));
        }
    }
}
