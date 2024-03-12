//import dependencies
const express = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");

//set up the express server router
const router = express.Router();

//sign in a user
router.post("/", async(req, res)=>{
    const promisePool = pool.promise();
    const {email, code} = req.body
    try{
        //Get the user from the database
        /* const user = await promisePool.query('CALL sp_login_usr(?)', [email]);
        //if(user[0][0] === null) throw new Error ('Invalid credentials!');
        
        //Compare the password with the password in the database
        const valid = await bcrypt.compare(password, user[0][0][0].user_pass)
        if(!valid) throw new Error ('Invalid credentials!');

        const token = jwt.sign({
            user_id: user[0][0][0].user_id,
            rol_id: user[0][0][0].rol_id,
            status_id: user[0][0][0].status_id
        }, process.env.PRIVATE_KEY, {expiresIn: "8h"})

        res.status(200).json({
            success: true,
            //user: user,
            token: token,
            //user_pass: user[0][0][0].user_pass,
            user_name: user[0][0][0].user_name,
            user_last: user[0][0][0].user_last
        }); */
        const user = await promisePool.query('SELECT * FROM otps WHERE email=(?)', [email]);
        if(user[0][0] === null) throw new Error ('Invalid credentials!');
        if(Date.now() > user[0][0].expiry) {
            await promisePool.query('DELETE FROM otps WHERE email = (?)', [email]);
            throw new Error('OTP has expired!')}
        
        //Compare the password with the password in the database
        const valid = await bcrypt.compare(code, user[0][0].otp)
        if(!valid) {
            //await promisePool.query('DELETE FROM otps WHERE email = (?)', [email]);
            throw new Error ('Invalid credentials!');}

        if(valid) {
            await promisePool.query('DELETE FROM otps WHERE email = (?)', [email]);
            await promisePool.query('UPDATE t_user SET status_id = 3000 WHERE user_email = (?)', [email]);
        }

        res.status(200).json({
            success: true,
            valid: true
            //user: user,
            //user_pass: user[0][0][0].user_pass,
        });
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