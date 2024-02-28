//import dependencies
const express = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");

//set up the express server router
const router = express.Router();

//sign in a user
router.post("/", async(req, res)=>{
    const promisePool = pool.promise();
    const {name, lastname, email, password} = req.body
    try{
        //Hash the password 
        const salt = await bcrypt.genSalt(15);
        const hashed = await bcrypt.hash(password, salt);

        //Call Stored Procedure with user Data to insert it into the database
        const result = await promisePool.query('CALL sp_create_usr(?, ?, ?, ?)', [email, hashed, name, lastname]);

        //show success message
        res.status(200).json({
            success: true,
            result: result   
        });
    } catch(err){
        //catch any errors
        console.error(err);
        res.status(500).send({
            success: false,
            result: {
                code: err.code,
                no: err.errno,
                message: err.sqlMessage
            }
        })
        
    }
    
});

//export the router
module.exports = router;