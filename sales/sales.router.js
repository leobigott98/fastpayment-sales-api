//import dependencies
const express = require("express");
const pool = require("../db");

//import middlewares
const auth = require("../middlewares/auth");
const {admin, sales} = require("../middlewares/roles");

//setup the router for express
const router = express.Router();

//Set up the route handlers

//Get all sales
router.get("/", [auth, sales], async (req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user
    
    try {
        const result = await promisePool.query('CALL sp_get_sales(?)', [user_id]);

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


//Add a new sale
router.post("/", [auth, sales], async (req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user
    const {
        v_cusm_id, 
        v_sale_serie,
        v_sale_total} = req.body;

    try {
        const result = await promisePool.query('CALL sp_add_sale(?,?,?,?)', [user_id, v_cusm_id, v_sale_serie, v_sale_total ]);

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

//Add a new sale detail
router.post("/detail", [auth, sales], async (req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user;
    const {
        v_sale_id, 
        v_prod_id,
        v_salesdt_qty,
        v_prod_price} = req.body;

    try {
        const result = await promisePool.query('CALL sp_add_saledt(?,?,?,?,?)', [ user_id, v_sale_id, v_prod_id, v_salesdt_qty, v_prod_price ]);

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