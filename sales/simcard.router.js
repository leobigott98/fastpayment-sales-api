//import dependencies
const express = require("express");
const pool = require("../db");

//import middlewares
const auth = require("../middlewares/auth");
const {sales} = require("../middlewares/roles");

//setup the router for express
const router = express.Router();

//Set up the route handlers

//Assign Simcard
router.post("/", [auth, sales], async (req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user
    const {status_terminal, serial_sim, operador, serial_id} = req.body
    
    try {
        const result = await promisePool.query('CALL sp_add_simcard(?, ?, ?, ?, ?)', [user_id, status_terminal, serial_sim, operador, serial_id]);

        res.status(200).json({
            ok: true,
            result: result[0][0][0]
        });
        
    } catch (error) {
        console.log(error)
        res.status(500).send({
            ok: false, 
            result: 'Not sure what happened :('
        })
    }
    
});

//Get Operadora
router.get("/operadora", [auth, sales], async (req, res)=>{
    const promisePool = pool.promise();
    
    try {
        const result = await promisePool.query('SELECT DISTINCT cod_name FROM p_codigos_tmovil');

        res.status(200).json({
            ok: true,
            result: result[0]
        });
        
    } catch (error) {
        console.log(error)
        res.status(500).send({
            ok: false, 
            result: 'Not sure what happened :('
        })
    }
    
});


//export the router
module.exports = router;