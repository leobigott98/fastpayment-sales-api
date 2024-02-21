//import dependencies
const express = require("express");
const pool = require("../db");

//import middlewares
const auth = require("../middlewares/auth");
const {admin, sales, finance, sales_finance} = require("../middlewares/roles");

//setup the router for express
const router = express.Router();

//Set up the route handlers


//Get all customers
router.get("/", [auth, sales_finance], async (req, res)=>{
    const promisePool = pool.promise();

    const {user_id, rol_id} = req.user

    try {
        const result = await promisePool.query('CALL sp_get_customer(?,?)', [user_id, rol_id]);

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

//Get one customer
router.get("/:id", [auth, sales_finance], async (req, res)=>{
    const promisePool = pool.promise();

    try {
        const {id} = req.params;
        const result = await promisePool.query('SELECT * FROM clientes WHERE id = ?', [id]);

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

//Add one customer
router.post("/", [auth, sales], async (req, res)=>{
    const promisePool = pool.promise();

    try {
        const {v_person_id, v_doc_typeid, v_cusm_ndoc, v_actv_id, v_cusm_namec, v_bank_id, v_acct_number, v_percon_name, v_percon_last, v_cod_movilid, v_percon_movil, v_cod_localid, v_percon_local, v_percon_email} = req.body;
        const {user_id} = req.user;
        const result = await promisePool.query('CALL sp_create_customer_v2(?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)', [v_person_id, v_doc_typeid, v_cusm_ndoc, v_actv_id, v_cusm_namec, v_bank_id, v_acct_number, user_id, v_percon_name, v_percon_last, v_cod_movilid, v_percon_movil, v_cod_localid, v_percon_local, v_percon_email]);

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