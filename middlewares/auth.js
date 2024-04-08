require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next)=>{
    const token = req.header("x-auth-token");
    if(!token) return res.status(401).send({
        success: false, 
        error: "Acces denied. No token provided"
    });

    try {
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        req.user = decoded;
    } catch (err) {
        console.log(err.message)
        return res.status(401).send({
            success: false, 
            error: "Token expired"
        })
    }

    next();
}

module.exports = auth;