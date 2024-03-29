//import dependencies
const express = require("express");
const pool = require("../db");

//import middlewares
const auth = require("../middlewares/auth");
const {admin, storage} = require("../middlewares/roles");

//setup the router for express
const router = express.Router();

//Set up the route handlers


//Add new inventory
router.post("/", [auth, storage], async (req, res)=>{
    const promisePool = pool.promise();
    const {user_id} = req.user;
    const {
        v_prod_id,
        v_mov_typeid,
        v_ubi_id,
        v_inv_qty} = req.body;

    try {
        const result = await promisePool.query('CALL sp_add_inventory(?,?,?,?,?)', [v_prod_id, v_mov_typeid, v_ubi_id, v_inv_qty, user_id]);

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