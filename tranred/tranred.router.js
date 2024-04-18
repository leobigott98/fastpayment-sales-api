//import dependencies
require("dotenv").config();
const express = require("express");

//import middlewares
const auth = require("../middlewares/auth");
const {admin, sales, finance, sales_finance} = require("../middlewares/roles");

//set up the express server router
const router = express.Router();

// login to tranred

router.get("/auth/login", [auth, sales_finance], async(req, res)=>{
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
            if(result.ok){
                const json = await result.json()
                res.status(200).json(json);
            }
        })
    }catch(error){
        res.status(400).json(error)
    }
    
    
    
});

// create customer in tranred

router.post("/customer/create/", [auth, sales_finance], async(req, res)=>{

    const {token} = req.body;
    const {commerce} = req.body

    const body = {
        //token: token,
        commerce: {
            comerRif: commerce.comerRif,
            comerTipoPer: commerce.comerTipoPer,
            idActivityXAfiliado: commerce.idActivityXAfiliado,
            comerDesc: commerce.comerDesc,
            comerCuentaBanco: commerce.comerCuentaBanco,
            locationCommerce: req.body.commerceAddress,
            locationContact: req.body.contactAddress,
            locationPos: req.body.POSAddress, 
            daysOperacion:{
                Lun: true,
                Mar: true,
                Mie: true, 
                Jue: true, 
                Vie: true,
                Sab: true, 
                Dom: true
            }
        },
        contacto: req.body.contacto
    }

    const headers = new Headers()
    headers.append('Authorization', `Bearer ${token}`);
    headers.append('Content-Type', 'application/json');

    try{
        fetch(`${process.env.TRANRED_URL}/commerce/create`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        })
        .then(async(result)=>{
            const json = await result.json()
            if(result.ok){
                res.status(200).json(json);
            }else{
                res.status(400).json(json);
            }
        })
    }catch(error){
        console.log(error)
        res.status(400).json({error: error.message})
    }   
    
});

// Get one customer
router.post('/customer/rif/:id', [auth, sales_finance], async(req, res) =>{
    const {token} = req.body
    const {id} = req.params

    try{
        fetch(`${process.env.TRANRED_URL}/commerce/rif/${id}`,{
            headers: {
                'Authorization': `Bearer ${token}`
            }})
            .then(async(response)=>{
                const json = await response.json()
                if(response.ok){
                    res.status(200).json(json)
                }else{
                    res.status(400).json(json)
                }
        })
    }catch(err){
        console.log(err)
        res.status(400).json({error: err.message})
    }    
})

// Get all customers
router.post('/customer/all', [auth, sales_finance], async(req, res) =>{
    const {token} = req.body

    try{
        fetch(`${process.env.TRANRED_URL}/commerce/all`,{
            headers: {
                'Authorization': `Bearer ${token}`
            }})
            .then(async(response)=>{
                const json = await response.json()
                if(response.ok){
                    res.status(200).json(json)
                }else{
                    res.status(400).json(json)
                }
        })
    }catch(err){
        console.log(err)
        res.status(400).json({error: err.message})
    }    
})

// Edit a customer
router.post('/customer/edit', [auth, sales_finance], async(req, res) =>{
    const {token} = req.body
    const {comerRif} = req.body
    const {commerce} = req.body

    const body = {
        comerRif: comerRif,
        commerce: commerce
    }

    try{
        fetch(`${process.env.TRANRED_URL}/commerce`,{
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)})
            .then(async(response)=>{
                const json = await response.json()
                if(response.ok){
                    res.status(200).json(json)
                }else{
                    res.status(400).json(json)
                }
        })
    }catch(err){
        console.log(err)
        res.status(400).json({error: err.message})
    }    
})

//export the router
module.exports = router;