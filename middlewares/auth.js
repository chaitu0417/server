const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
    try {
        const token = req.cookies.token; // Assuming you're using cookies for token storage

        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Invalid token' });
    }
};
