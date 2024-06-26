//import dependencies
const jwt = require("jsonwebtoken");
const express = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");

//set up the express server router
const router = express.Router();

//sign in a user
router.post("/", express.urlencoded({ extended: false }), async(req, res)=>{
    const promisePool = pool.promise();
    const {email, password} = req.body
    try{
        //Get the user from the database
        const user = await promisePool.query('CALL sp_login_usr(?)', [email]);
        //if(user[0][0] === null) throw new Error ('Invalid credentials!');
        
        //Compare the password with the password in the database
        const valid = await bcrypt.compare(password, user[0][0][0].user_pass)
        if(!valid) throw new Error ('Invalid credentials!');

        const token = jwt.sign({
            user_id: user[0][0][0].user_id,
            user_email: user[0][0][0].user_email,
            rol_id: user[0][0][0].rol_id,
            status_id: user[0][0][0].status_id
        }, process.env.PRIVATE_KEY, {expiresIn: "8h"})

        const userInfo = {
            success: true,
            token: token,
            email: user[0][0][0].user_email,
            name: user[0][0][0].user_name,
            lastname: user[0][0][0].user_last,
            role: user[0][0][0].rol_id,
            status: user[0][0][0].status_id
        }

        req.session.regenerate((err)=>{
            if(err) throw new Error(err);
            req.session.user = userInfo;
            req.session.status = user[0][0][0].status_id;
            req.session.authenticated = true;
            req.session.save((err)=>{
                if(err) throw new Error(err);
                res.status(200).json(userInfo);
            })
        })        
        
    } catch(err){
        console.error(err);
        res.status(401).send({
            succecss: false,
            result: 'Wrong email or password'
        })
        
    }
    
});

//export the router
module.exports = router;