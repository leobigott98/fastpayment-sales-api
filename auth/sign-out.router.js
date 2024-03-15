//import dependencies
const express = require("express");
const pool = require("../db");

//set up the express server router
const router = express.Router();

//sign in a user
router.post("/", async(req, res)=>{
    
    try{
        req.session.authenticated = false;
        req.session.userInfo = null;
        req.session.status = null;
        req.session.save((err)=>{
            if(err) throw new Error(err);
            req.session.regenerate((err)=>{
                if(err) throw new Error(err);
                res.status(200).send({
                    success: true,
                    result: 'user logged out'
                })
            })
        })
        
    } catch(err){
        console.error(err);
        res.status(401).send({
            succecss: false,
            result: 'Not sure what happened'
        })
        
    }
    
});

//export the router
module.exports = router;