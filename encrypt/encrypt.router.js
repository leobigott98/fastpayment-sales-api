const express = require("express");
const router = express.Router();
const {aes256Encrypt} = require("./controllers");

router.post('/aes256', aes256Encrypt);

module.exports = router;