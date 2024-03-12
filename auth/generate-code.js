//import dependencies
const express = require("express");
const pool = require("../db");
//module.id = nanoid

//import middlewares
const auth = require("../middlewares/auth");

//setup the router for express
const router = express.Router();

//Get all your customers
router.get("/", async (req, res)=>{

    try {
        const result =  await import("./otp.mjs")

        res.status(200).json({
            ok: true,
            result: result.nanoid()
        });
        
    } catch (error) {
        res.status(500).send({
            ok: false, 
            result: 'Not sure what happened :('
        })
    }
    
});

module.exports = router;