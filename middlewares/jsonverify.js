const jwt = require('jsonwebtoken');

module.exports = function makeJsonverify(db, jwt, E, utils) {
    return async function jsonverify(req, res, next) {
        const bearerHeader = req.headers["authorization"];
        if (typeof bearerHeader !== "undefined") {
            const token = bearerHeader.split(" ")[1];

            try {
                var decoded = jwt.verify(token, process.env.SignKey); // Use SignKey

                // Log decoded token for debugging
                console.log("DECODED", JSON.stringify(decoded, null, 2));

                // Use decoded.data.id instead of decoded.id
                const user = await db.User.findById(decoded.data.id);
                if (!user) {
                    console.log("User not found with ID:", decoded.data.id);
                    throw new E.UserNotAuthenticated("token not valid");
                }

                // Check if the user is verified
                if (!user.verified) {
                    console.log("User not verified:", user._id);
                    throw new E.UserNotAuthenticated("user not verified");
                }

                // Log loginStamp for debugging
                console.log("LoginStamp comparison - Token:", decoded.data.loginStamp, "User:", user.loginStamp);

                // Check if the loginStamp matches
                if (String(user.loginStamp) !== String(decoded.data.loginStamp)) {
                    console.log("Mismatch in loginStamp - Token:", decoded.data.loginStamp, "User:", user.loginStamp);
                    throw new E.UserNotAuthenticated("user connected on another device.");
                }

                // Remove password before attaching user to request
                delete user.password;
                req.user = user;
                console.log("USER:", JSON.stringify(user, null, 2));

                // Update lastActive timestamp
                await db.User.updateOne(
                    { _id: decoded.data.id },
                    {
                        $set: {
                            lastActive: new Date(),
                        }
                    }
                );

                next();
            } catch (err) {
                console.error("Authentication error:", err);
                err.status = 401;
                next(err);
            }
        } else {
            console.log("Authorization header not supplied");
            return next(new E.UserNotAuthenticated("token not supplied"));
        }
    }
}
