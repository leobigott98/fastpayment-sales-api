//import dependencies
const express = require("express");
const pool = require("../db");

//import middlewares
const auth = require("../middlewares/auth");
const {admin, sales, finance} = require("../middlewares/roles");

//setup the router for express
const router = express.Router();

//Set up the route handlers

//Get payment options
router.get("/options", [auth, finance], async (req, res)=>{
    const promisePool = pool.promise();
    
    try {
        const result = await promisePool.query('SELECT * FROM p_ops_pay');

        res.status(200).json({
            ok: true,
            result: result[0]
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