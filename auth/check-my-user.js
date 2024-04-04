//import dependencies
const express = require("express");
const pool = require("../db");

//middlewares
const auth = require('../middlewares/auth');

//set up the express server router
const router = express.Router();


//sign in a user
router.get("/", [auth], async(req, res)=>{
    const promisePool = pool.promise();
    try{
        const {user_id} = req.user
        const user = await promisePool.query('SELECT user_email, user_name, user_last, rol_id, status_id FROM t_user WHERE user_id = ?', [user_id]);

        const userInfo = {
            user_email: user[0][0].user_email,
            user_name: user[0][0].user_name,
            user_last: user[0][0].user_last,
            user_role: user[0][0].rol_id,
            user_status: user[0][0].status_id
        }

        res.status(200).json(userInfo);      
        
    } catch(err){
        console.error(err);
        res.status(401).send({
            succecss: false,
            result: 'Invalid credentials'
        })
        
    }
    
});

//export the router
module.exports = router;