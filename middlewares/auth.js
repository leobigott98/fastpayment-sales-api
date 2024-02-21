require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next)=>{
    const token = req.header("x-auth-token");
    if(!token) return res.status(401).send({
        ok: false, 
        error: "Acces denied. No token provided"
    });

    try {
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send({
            ok: false, 
            error: "Token expired"
        })
    }

    next();
}

module.exports = auth;