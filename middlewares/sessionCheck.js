require("dotenv").config();

const authenticated = (req, res, next)=>{
    if(req.session.authenticated) next()
    else return res.status(401).send({
        ok: false, 
        error: "Not authenticated"
    });
}
const active = (req, res, next)=>{
    if(req.session.status = 3000) next()
    else return res.status(403).send({
        ok: false,
        error: "Not authorized"
    })
}

module.exports = {authenticated, active};