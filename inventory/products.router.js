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

// GET products of a sale
router.post("/sale", [auth], async (req, res)=>{
    const promisePool = pool.promise();
    const {sale_id} = req.body;

    try {
        const result = await promisePool.query(`SELECT concat(t_product.prod_brand, ' ', t_product.prod_model) as name, t_saledt.prod_id, t_saledt.sale_id FROM t_saledt INNER JOIN (t_sales, t_product) ON (t_saledt.sale_id = t_sales.sale_id and t_saledt.prod_id = t_product.prod_id) WHERE t_saledt.sale_id = (?)`, [sale_id]);

        res.status(200).json({
            ok: true,
            result: result[0]
        });
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send({
            ok: false, 
            result: 'Not sure what happened :('
        })
    }
    
});

//export the router
module.exports = router;