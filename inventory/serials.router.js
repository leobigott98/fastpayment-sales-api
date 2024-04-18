//import dependencies
const express = require("express");
const pool = require("../db");

//import middlewares
const auth = require("../middlewares/auth");
const {admin, storage, sales} = require("../middlewares/roles");

//setup the router for express
const router = express.Router();

//Set up the route handlers


//Add a serial
router.post("/", [auth, storage], async (req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user
    const {
        v_prod_id,
        v_serial_num
        } = req.body;

    try {
        const result = await promisePool.query('CALL sp_add_serial(?,?,?)', [user_id, v_prod_id,v_serial_num ]);

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

//Assign serial
router.post("/asignar-serial", [auth, sales], async (req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user
    const {
        v_prod_id,
        v_sale_id,
        v_serial_num
        } = req.body;

    try {
        const result = await promisePool.query('CALL sp_assign_serial(?,?,?,?)', [user_id, v_sale_id, v_prod_id, v_serial_num ]);

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

//Get all  serials from product
router.post("/all", [auth, sales], async (req, res)=>{
    const promisePool = pool.promise();
    const {product_id} = req.body;

    try {
        const result = await promisePool.query('CALL sp_get_serials(?)', [product_id]);

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