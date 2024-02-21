//import dependencies
const express = require("express");
const pool = require("../db");

//import middlewares
const auth = require("../middlewares/auth");
const {admin, sales_finance_storage, storage} = require("../middlewares/roles");

//setup the router for express
const router = express.Router();

//Set up the route handlers


//Create product
router.post("/", [auth, storage], async (req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user
    const {
        v_prod_brand,
        v_prod_model,
        v_prod_spec,
        v_prod_price,
        v_prod_serial} = req.body;

    try {
        const result = await promisePool.query('CALL sp_create_product(?,?,?,?,?,?)', [v_prod_brand, v_prod_model, v_prod_spec, v_prod_price, v_prod_serial, user_id ]);

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

router.get("/", [auth], async (req, res)=>{
    const promisePool = pool.promise();

    try {
        const result = await promisePool.query('CALL sp_get_products()');

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