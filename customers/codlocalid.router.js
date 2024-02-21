//import dependencies
const express = require("express");
const pool = require("../db");

//import middlewares
const auth = require("../middlewares/auth");

//setup the router for express
const router = express.Router();

//Set up the route handlers


//Get all customers
router.get("/", [auth], async (req, res)=>{
    const promisePool = pool.promise();

    try {
        const result = await promisePool.query('SELECT cod_localid, cod_value FROM p_codigos_tlocal');

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