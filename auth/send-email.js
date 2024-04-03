require("dotenv").config();
const nodemailer = require("nodemailer");
const pool = require("../db");
const bcrypt = require("bcrypt");

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
async function main(mail, subject, message) {
  // send mail with defined transport object
  if(subject === 'otp'){
    try {
      await import("./otp.mjs").then(
        async (result) => {
          //const jsonOtp = await otp.json();
          const otp = result.nanoid();
          const promisePool = pool.promise();
          const salt = await bcrypt.genSalt(15);
          //const hashed = await bcrypt.hash(jsonOtp.result, salt);
          const hashed = await bcrypt.hash(otp, salt);
          /* await promisePool
            .query("UPDATE t_user otp = ? WHERE email = ?", [
              jsonOtp.result,
              mail,
            ])
            .then(async (result) => {
              if (result[0][0].error_num != null) {
                throw new Error("Ha ocurrido un error desconocido");
              } else {
                const info = await transporter.sendMail({
                  from: '"Leo Bigott" <l.bigott@fastpayment.com.ve>', // sender address
                  to: mail, // list of receivers
                  subject: "Registro FastPayment", // Subject line
                  //text: "Hello world?", // plain text body
                  html: `<h1>Bienvenido a la Aplicación de Ventas de FastPayment</h1>
              <p>Para validar su dirección de correo, ingrese la siguiente OTP en la aplicación: <b> ${jsonOtp.result}</b> </p>`, // html body
                });
  
                console.log("Message sent: %s", info.messageId);
                // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
              }
            }); */
            await promisePool
            .query("INSERT INTO otps(email, otp, expiry) VALUES(?,?,?)", [
              mail,
              hashed,
              Date.now() + 10 * 60 * 1000
            ])
            .then(async (result) => {
              
                const info = await transporter.sendMail({
                  from: '"Leo Bigott" <l.bigott@fastpayment.com.ve>', // sender address
                  to: mail, // list of receivers
                  subject: "Registro FastPayment", // Subject line
                  //text: "Hello world?", // plain text body
                  html: `<h1>Bienvenido a la Aplicación de Ventas de FastPayment</h1>
              <p>Para validar su dirección de correo, ingrese la siguiente OTP en la aplicación: <b> ${otp}</b> </p>`, // html body
                });
  
                console.log("Message sent: %s", info.messageId);
                // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
              
            });
        }
      );
    } catch (err) {
      console.log(err);
    }
  }else {
    try {              
          const info = await transporter.sendMail({
            from: '"Leo Bigott" <l.bigott@fastpayment.com.ve>', // sender address
            to: mail, // list of receivers
            subject: subject, // Subject line
            html: `<h1> ${message.header}</h1>
              <p>${message.body}</p>`, // html body
            });
  
            console.log("Message sent: %s", info.messageId);
            // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
    } catch (err) {
      console.log(err);
    }
  }
  
}

//main().catch(console.error);

module.exports = main;
