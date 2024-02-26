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

    try {
        const result = await promisePool.query('SELECT * FROM p_rol');

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

//Update rol
router.post("/update", [auth, admin], async(req,res)=>{
    const promisePool = pool.promise();
    const {user_id} = req.user;
    const { v_user_id_1,
            v_rol_id,
            v_sell_fee,
            v_sell_location} = req.body;

    try{
        const result = await promisePool.query('CALL sp_update_rol(?,?,?,?,?)', [user_id, v_user_id_1, v_rol_id, v_sell_fee, v_sell_location]);

        res.status(200).json({
            ok: true,
            result: result[0][0]
        })
    }catch(err){
        res.status(500).send({
            ok: false, 
            result: 'Not sure what happened :(',
            error: err.message
        })
    }
});

//export the router
module.exports = router;