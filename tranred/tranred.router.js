//import dependencies
require("dotenv").config();
const express = require("express");
const {saveToSQLite, deleteTokens, getToken} = require("../sqlite/db")
const pool = require("../db")

//import middlewares
const auth = require("../middlewares/auth");
const {admin, sales, finance, sales_finance} = require("../middlewares/roles");
const {createCustomer, getOneCustomer, getAllCustomers, editCustomer, createTerminal, getTerminal, createTranredCustomer, updatePlans, getPlans,createTerminalInDB, getCuotas, cancelCuota, getTerminalHistory, changeTerminalStatus, updateBankAccount, updateTranredCustomer, getAllTerminals, updateTerminal} = require("./controllers");

//set up the express server router
const router = express.Router();

// test update on mysql
router.post("/test/update", async(req,res)=>{
    const {commerce} = req.body
    const promisePool = pool.promise();
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const current = new Date(Date.now() - tzoffset);
    const timeString = current.toISOString().slice(0,current.toISOString().indexOf("T")).concat(" ", current.toISOString().slice((current.toISOString().indexOf("T")+1),current.toISOString().indexOf(".")));
    const RIF = commerce.comerRif.substring(1);
    try{
        const dbResponse = await promisePool.query('UPDATE t_customer SET cusm_tranred = ?, cusm_dupdate = ? WHERE cusm_ndoc = ?', [1, timeString, RIF]);
        if(dbResponse[0].affectedRows == 1){
            res.status(200).json(dbResponse)
        }else throw new Error('Ha ocurrido un error')
        
    }catch(err){
        res.status(400).json({statusCode: 400, message: err.message})
    }
    
})

// login to tranred

router.get("/auth/login", [auth, sales_finance], async(req,res)=>{
    const body = {
        login: process.env.TRANRED_USER,
        password: process.env.TRANRED_PASSWORD
    }

    try{
        fetch(`${process.env.TRANRED_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        .then(async(result)=>{
            const json = await result.json()
            if(result.ok){
                deleteTokens();
                saveToSQLite(json.access_token, Date.now().toString())
                res.status(200).json(json)
            }else{
                res.status(400).json(json)
            }
        })
    }catch(error){
        res.status(400).json(error)
    }    
});

// create customer in tranred

router.post("/customer/create", [auth, sales_finance], createCustomer)

router.post("/test/customer/create", createTranredCustomer)

// Get one customer
router.get('/customer/rif/:id', [auth, sales_finance], getOneCustomer)

// Get all customers
router.get('/customer/all', [auth, sales_finance], getAllCustomers)

// Edit a customer
router.post('/customer/edit', [auth, sales_finance], editCustomer)

// Create a terminal
router.post('/terminal/create/:id', [auth, sales_finance], createTerminal)

// Get a terminal
router.get('/terminal/:id', [auth, sales_finance], getTerminal)

// Creater terminal in DB
router.post('/terminal/new', createTerminalInDB)

//Change terminar status
router.put('/terminal/updateStatus/:id', changeTerminalStatus)

// Edit Terminal Bank Account
router.post('/terminal/bank/:id', [auth, sales_finance], updateBankAccount)

// Get Terminal History
router.post('/terminal/history/:terminal/:startDate/:endDate', [auth, sales_finance], getTerminalHistory)

// Update Plans from Tranred
router.get('/terminal/plans/update', [auth, admin], updatePlans)

// Get Plans from SQLite
router.get('/terminal/plans/all', [auth, sales_finance], getPlans)

router.get('/terminal/getCuotasPendientes/:terminal/:planId/:startDate/:endDate', [auth, sales_finance], getCuotas)

router.post('/terminal/anularCuotas', [auth, sales_finance], cancelCuota)

router.put('/customer', [auth, sales], updateTranredCustomer)

router.get('/terminal/fp/all', [auth, sales], getAllTerminals)

router.post('/terminal/update', [auth, sales], updateTerminal)


//export the router
module.exports = router;