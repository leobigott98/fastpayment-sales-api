//import dependencies
require("dotenv").config();
const express = require("express");

//import middlewares
const auth = require("../middlewares/auth");
const {admin, sales, finance, sales_finance} = require("../middlewares/roles");

//set up the express server router
const router = express.Router();

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

router.post("/customer/create/", [auth, sales_finance], async(req, res)=>{

    const {token} = req.body;

    const body = {
        commerce: req.body.commerce, 
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
        res.status(400).json({error: error.message})
    }
    
    
    
});

//export the router
module.exports = router;