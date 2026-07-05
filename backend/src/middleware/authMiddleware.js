const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: "Token missing"
        });
    }

    try {

        const decoded = jwt.verify(
            token.replace("Bearer ", ""),
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid token"
        });

    }

};

const optionalToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        next();
        return;
    }

    try {
        const decoded = jwt.verify(
            token.replace("Bearer ", ""),
            process.env.JWT_SECRET
        );

        req.user = decoded;
    } catch (error) {
        // Ignore invalid token for optional access
    }

    next();
};

module.exports = verifyToken;
module.exports.optionalToken = optionalToken;
