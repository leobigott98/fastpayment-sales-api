// import dependencies
require("dotenv").config();
const nodemailer = require("nodemailer");
const pool = require("../db");
const bcrypt = require("bcrypt");
const express = require("express");

//set up the express server router
const router = express.Router();

// create email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.SMTPUSER,
    pass: process.env.SMTPPASSWORD,
  },
});

// async..await is not allowed in global scope, must use a wrapper
router.post("/new-otp", async (req,res)=>{
    const {email} = req.body;

    // send mail with defined transport object

    try {
        await import("./otp.mjs").then(
          async (result) => {
            const otp = result.nanoid();
            const promisePool = pool.promise();
            const salt = await bcrypt.genSalt(15);
            const hashed = await bcrypt.hash(otp, salt);
              await promisePool
              .query("INSERT INTO otps(email, otp, expiry) VALUES(?,?,?)", [
                email,
                hashed,
                Date.now() + 10 * 60 * 1000
              ])
              .then(async () => {
                
                  const info = await transporter.sendMail({
                    from: '"Leo Bigott" <l.bigott@fastpayment.com.ve>', // sender address
                    to: email, // list of receivers
                    subject: "Registro FastPayment", // Subject line
                    //text: "Hello world?", // plain text body
                    html: `<h1>Validación de Correo</h1>
                <p>Para validar su dirección de correo, ingrese la siguiente OTP en la aplicación: <b> ${otp}</b> </p>`, // html body
                  });
    
                  console.log("Message sent: %s", info.messageId);
                  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
                  res.status(200).json({success: true})
                
              });
          }
        );
      } catch (err) {
        res.status(400).json({success: false, message: err.message})
      }

})   

//export the router
module.exports = router;