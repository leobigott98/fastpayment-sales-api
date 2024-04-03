//import dependencies
const express = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");
const sendEmail = require("./send-email");

//set up the express server router
const router = express.Router();

//sign-up in a user
router.post("/", async (req, res) => {
  const promisePool = pool.promise();
  const { name, lastname, email, password } = req.body;
  try {
    //Hash the password
    const salt = await bcrypt.genSalt(15);
    const hashed = await bcrypt.hash(password, salt);

    //Call Stored Procedure with user Data to insert it into the database
    await promisePool
      .query("CALL sp_create_usr(?, ?, ?, ?)", [email, hashed, name, lastname])
      .then(async (result) => {
        if (result[0][0][0].error_num > 0) {
          res.status(500).send({
            success: true,
            result: result[0][0][0],
          });
          throw new Error(result[0][0][0].message);
        } else {
            await sendEmail(email, otp, '')
            .then(() => {
              //show success message
              res.status(200).json({
                success: true,
                result: result[0][0][0],
              });
            });
        }
      });
      /* await promisePool
      .query("CALL insert_new_user(?, ?, ?, ?)", [email, name, hashed, lastname])
      .then(async (result) => {
        if (result[0][0].v_error_sql != null) {
          res.status(500).send({
            success: false,
            result: result[0][0],
          });
          throw new Error("Correo inválido o ya registrado");
        } else {
            await sendEmail(email)
            .then(() => {
              //show success message
              res.status(200).json({
                success: true,
                result: result[0][0],
              });
            });
        }
      }); */

  } catch (err) {
    //catch any errors
    console.error(err);
    
  }
});

//export the router
module.exports = router;
