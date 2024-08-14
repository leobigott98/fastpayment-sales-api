//import dependencies
const express = require("express");
const pool = require("../db");

//import middlewares
const auth = require("../middlewares/auth");
const {admin, sales, finance, sales_finance} = require("../middlewares/roles");

//setup the router for express
const router = express.Router();

//Set up the route handlers

//Get payment options
router.get("/options", [auth, sales_finance], async (req, res)=>{
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

//Add new payment
router.post("", [auth, sales_finance], async (req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user;
    const { v_sale_id,
            v_ops_id,
            v_bank_id,
            v_pay_ref,
            v_pay_amount} = req.body;
    
    try {
        const result = await promisePool.query('CALL sp_register_pay_v1(?,?,?,?,?,?)', [user_id, v_sale_id, v_ops_id, v_bank_id, v_pay_ref, v_pay_amount]);

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

// Get payment detail
router.get('/:id', [auth, finance], async(req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user;
    const { id } = req.params;
    
    try {
        const result = await promisePool.query('CALL sp_get_paydt(?,?)', [user_id, id]);

        res.status(200).json({
            result: result[0]
        });
        
    } catch (error) {
        res.status(400).json({ message: error.message})
    }
})




//export the router
module.exports = router;