//import dependencies
const express = require("express");
const pool = require("../db");

//import middlewares
const auth = require("../middlewares/auth");

//setup the router for express
const router = express.Router();

//Set up the route handlers


//Get all customers
router.post("/", [auth], async (req, res)=>{
    const promisePool = pool.promise();

    const {pais_id, estado_id} = req.body

    try {
        const result = await promisePool.query('CALL sp_get_municipality(?, ?)', [pais_id, estado_id]);

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

module.exports = router;