//import dependencies
require("dotenv").config();
const express = require("express");
const {saveToSQLite, deleteTokens, getToken} = require("../sqlite/db")
const pool = require("../db")
const {download} = require("./controllers");


router.get('/image/fondo-blanco',  downloadFondoBlanco)

router.get('/image/recurso-1',  downloadRecurso)

//export the router
module.exports = router;