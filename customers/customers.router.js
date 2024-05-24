//import dependencies
const express = require("express");
const pool = require("../db");

//import middlewares
const auth = require("../middlewares/auth");
const {admin, sales, finance, sales_finance} = require("../middlewares/roles");
const {authenticated, active} = require("../middlewares/sessionCheck.js")

//setup the router for express
const router = express.Router();

//Set up the route handlers


//Get all your customers
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


//Get ALL customers
router.get("/all", [auth, sales], async (req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user

    try {
        const result = await promisePool.query('CALL sp_all_customer(?)', [user_id]);

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

//Add one customer
router.post("/", [auth, sales], async (req, res)=>{
    const promisePool = pool.promise();

    try {
        const {v_person_id, v_doc_typeid, v_cusm_ndoc, v_actv_id, v_cusm_namec, v_bank_id, v_acct_number, v_percon_name, v_percon_last, v_cod_movilid, v_percon_movil, v_cod_localid, v_percon_local, v_percon_email} = req.body;
        const {user_id} = req.user;
        const result = await promisePool.query('CALL sp_create_customer_v3(?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)', [v_person_id, v_doc_typeid, v_cusm_ndoc, v_actv_id, v_cusm_namec, v_bank_id, v_acct_number, user_id, v_percon_name, v_percon_last, v_cod_movilid, v_percon_movil, v_cod_localid, v_percon_local, v_percon_email]);

        res.status(200).json({
            ok: true,
            result: result[0][0][0],
            info: result[0][1][0]
        });
        
    } catch (error) {
        res.status(500).send({
            ok: false, 
            result: 'Not sure what happened :('
        })
    }
    
});

// Get One Customer
router.get("/:id", [auth, sales_finance], async (req, res)=>{
    const sql = `SELECT t_customer.cusm_namec, t_customer.cusm_tranred, t_percontact.percon_email, t_percontact.percon_name, t_percontact.percon_last, t_percontact.percon_local, t_percontact.percon_movil, p_codigos_tlocal.cod_value AS codLocal, p_codigos_tmovil.cod_value AS codMovil 
    FROM t_percontact
    INNER JOIN t_customer ON t_percontact.cusm_id = t_customer.cusm_id 
    INNER JOIN p_codigos_tlocal ON p_codigos_tlocal.cod_localid = t_percontact.cod_localid
    INNER JOIN p_codigos_tmovil ON p_codigos_tmovil.cod_movilid = t_percontact.cod_movilid
    WHERE t_customer.cusm_id = ?; `
    const {id} = req.params;
    const promisePool = pool.promise();

    try {
        const result = await promisePool.query(sql, [id]);

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

})

module.exports = router;