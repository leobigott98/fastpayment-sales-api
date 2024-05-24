//import dependencies
const express = require("express");
const pool = require("../db");

//import middlewares
const auth = require("../middlewares/auth");
const {admin, sales, sales_finance} = require("../middlewares/roles");

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
        console.log(error)
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

    const { v_sale_id,
            v_prod_id,
            v_salesdt_qty,
            v_prod_price,
            v_plan_id
            } = req.body;

    try {
        const result = await promisePool.query('CALL sp_add_saledt(?,?,?,?,?,?)', [ user_id, v_sale_id, v_prod_id, v_plan_id, v_salesdt_qty, v_prod_price  ]);

        res.status(200).json({
            ok: true,
            result: result[0][0]
        });
        
    } catch (error) {
        res.status(500).json({error: error.message})
    }
    
});

// get customer details from a sale
router.get('/customer/:id', [auth, sales_finance], async(req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user;
    const {id} = req.params;

    try{
        const result = await promisePool.query('CALL sp_get_commerce_tr(?,?)', [id, user_id])

        if(result[0][0][0].error_num){
            res.status(400).json({
                success: false, 
                result: result[0][0]
            })
        }else{
            res.status(200).json({
                success: true,
                result: result[0]
            })
        }

       
    }catch(err){
        res.status(400).json({
            success: false,
            error: err,
            message: err.message
        })
    }
})

// get serial from a sale
router.get('/serials/:id', [auth, sales_finance], async(req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user;
    const {id} = req.params;

    try{
        const result = await promisePool.query('CALL sp_get_serials_tr(?,?)', [user_id, id])
        //res.status(200).json({result: result})

        if(result[0][0][0].error_num){
            res.status(400).json({
                success: false, 
                result: result[0][0]
            })
        }else{
            res.status(200).json({
                success: true,
                result: result[0][0]
            })
        }

       
    }catch(err){
        res.status(400).json({
            success: false,
            error: err,
            message: err.message
        })
    }
})

// assign account number to a sale
router.post('/account', [auth, sales_finance], async (req,res)=>{
    const {user_id} = req.user;
    const {v_sale_id, v_bank_id, v_acct_number, v_serial_num} = req.body;

    console.log(req.body)
    try {
        const promisePool = pool.promise();
        const response = await promisePool.query('CALL sp_add_account(?,?,?,?,?)', [user_id, v_sale_id, v_serial_num, v_bank_id, v_acct_number]);
        res.status(200).json(response[0][0][0]);
        
    } catch (error) {
        res.status(400).json(error);
    }


})

router.get('/detail/:id', [auth, sales_finance], async(req, res)=>{
    const {id} = req.params
    const sqlQuery = `SELECT t_saledt.sale_id, t_saledt.saledt_id, t_product.prod_brand, t_product.prod_model, t_product.prod_price, t_saledt.saledt_qty, t_plans.plan_desc, t_plans.plan_amount, t_sales.sale_dreg, t_sellers.sell_fee, t_user.user_email, t_user.user_name, t_user.user_last
    FROM t_saledt
    INNER JOIN t_product ON t_saledt.prod_id = t_product.prod_id
    INNER JOIN t_sales ON t_saledt.sale_id = t_sales.sale_id
    LEFT JOIN t_plans ON t_saledt.plan_id = t_plans.plan_id
    INNER JOIN t_sellers ON t_sales.sell_id = t_sellers.sell_id
    INNER JOIN t_user ON t_sellers.user_id = t_user.user_id
    WHERE t_saledt.sale_id = ?;`

    try {
        const promisePool = pool.promise();
        const response = await promisePool.query(sqlQuery, [id]);
        
        res.status(200).json(response[0]);

    } catch (error) {
        res.status(400).json(error.message)
    }
})


//export the router
module.exports = router;