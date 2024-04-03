//import dependencies
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const express = require("express");
const pool = require("../db");
const sendEmail = require("./send-email");

//set up the express server router
const router = express.Router();

//generate token and send email
router.post("/sendEmail", async(req, res)=>{
    const promisePool = pool.promise();
    const {email, origin} = req.body
    try{
        //Get the user from the database
        const user = await promisePool.query('SELECT user_email FROM t_user WHERE user_email = ?', [email]);
        console.log(user[0][0])
        if(user[0][0] === null) throw new Error ('Invalid credentials!');
    
        const token = jwt.sign({
            user_email: user[0][0].user_email
        }, process.env.PRIVATE_KEY, {expiresIn: "15m"})

        await sendEmail(email, 'Restablecer Contraseña', {header: 'Restablecimiento de Contraseña para FastSales APP', body: 'Ingrese al siguiente enlace para restablecer su contraseña: '+ origin+token})

        res.status(200).json({
            success: true,
            //token
            token: token,
        });
        
    } catch(err){
        console.error(err);
        res.status(401).send({
            succecss: false,
            result: err.message
        })
        
    }
    
});

// verify the URL password
router.get("/checkURL/:id", async (req, res)=>{
    // check if token is in the url
    if(!req.params.id){
        return res.status(400).json({error: 'No id was provided'})
    }
    const urlToken = req.params.id;
    try {

        // check if url was used

        // connection pool
        const promisePool = pool.promise();

        // update the user in the database
        await promisePool.query('SELECT COUNT (id) AS COUNT FROM used_urlids WHERE token = ?', [urlToken])
            .then((result)=>{
                console.log(result)
                if(result[0][0].COUNT > 0){
                    return res.status(400).json({error: 'url already used'})
                } 
                // decode the url 
                const decoded = jwt.verify(urlToken, process.env.PRIVATE_KEY);
                const user_email = decoded.user_email;
                
                // generate another token
                const userToken = jwt.sign({
                    user_email: user_email,
                    resetPassword: true
                }, process.env.PRIVATE_KEY, {expiresIn: "15m"})

                //send response with email and new token
                res.status(200).json({email: user_email, token: userToken});
                    
                
            })
    } catch (err) {
        console.log(err.message)
        return res.status(401).json({ error: "Not valid URL"})
    }
});

// update the password
router.post("/reset", async (req,res)=>{

    //check token
    const token = req.header("x-auth-token");
    if(!token) return res.status(401).json({ error: "Not valid request" });
    try {
        // decode the token  
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        const { user_email, resetPassword } = decoded;

        if(!resetPassword){
            return res.status(401).json({error: 'invalid request'})
        }

        // connection pool
        const promisePool = pool.promise();

        // get new password
        const { password } = req.body;

        // get the url
        const {url} = req.body;

        // hash the new password
        const salt = await bcrypt.genSalt(15);
        const hashed = await bcrypt.hash(password, salt);

        // update the user in the database
        await promisePool.query('UPDATE t_user SET user_pass = ? WHERE user_email = ?', [hashed, user_email]);

        // insert the url into de database
        await promisePool.query('INSERT INTO used_urlids(token, dreg) VALUES(?,?)', [url, Date.now()]);

        res.status(200).json({succed: true, mssg: "password updated successfully"})

    }catch(err){
        console.log(err.message)
        res.status(401).json({error: "Something happened"});
    }



});


//export the router
module.exports = router;