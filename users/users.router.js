//import dependencies
const express = require("express");
const pool = require("../db");

//import middlewares
const auth = require("../middlewares/auth");
const {admin} = require("../middlewares/roles");

//setup the router for express
const router = express.Router();

//Set up the route handlers


//Create product
router.get("/", [auth, admin], async (req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user

    try {
        const result = await promisePool.query('CALL sp_get_users(?)', [user_id ]);

        res.status(200).json({
            ok: true,
            result: result[0][0]
        });
        
    } catch (error) {
        res.status(500).send({
            ok: false, 
            result: 'Not sure what happened :('
        })
    }
    
});

//export the router
module.exports = router;