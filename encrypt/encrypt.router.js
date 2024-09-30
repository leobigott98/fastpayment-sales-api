const express = require("express");
const router = express.Router();
const {aes256Encrypt, rsaEncrypt} = require("./controllers");

router.post('/aes256', aes256Encrypt);
router.post('/rsa', rsaEncrypt);

module.exports = router;