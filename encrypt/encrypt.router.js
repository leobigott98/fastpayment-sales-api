const express = require("express");
const router = express.Router();
const {aes256Encrypt, rsaEncrypt, remoteKeyRsaEncrypt, generateKEK, rsaDecrypt} = require("./controllers");

router.post('/aes256', aes256Encrypt);
router.post('/rsa', rsaEncrypt);
router.get('/rsa/remoteKeyDownload', remoteKeyRsaEncrypt);
router.get('/generateKEK', generateKEK);
router.post('/rsa/decrypt', rsaDecrypt);

module.exports = router;