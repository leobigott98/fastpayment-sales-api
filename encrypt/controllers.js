const aes256 = require('aes256');
const NodeRSA = require('node-rsa');
const fs = require('fs');
const publicKey = fs.readFileSync('./certs/ccr_publicKey.pem', 'utf8')

const aes256Encrypt = async(req, res)=>{
    try{
        const {input, key} = req.body
        const encryptedString = aes256.encrypt(key, input)
        res.status(200).json({message:'success', encrypted: encryptedString})

    }catch(err){
        res.status(400).json({message: err.message})
    }

/*     const key = process.env.CCR_KEY
    const user = process.env.CCR_USER
    const password = process.env.CCR_PASS

    const encryptedUser = aes256.encrypt(key, user)
    const encryptedPassword = aes256.encrypt(key, password)

    const parameters = {
        usuario: encryptedUser,
        password: encryptedPassword
} */

}

const rsaEncrypt = (req, res)=>{
    try {
        const {input} = req.body;
        const key = new NodeRSA(publicKey);
        const encrypted = key.encrypt(input, 'base64');
        res.status(200).json({message: 'success', encrypted: encrypted});
        
    } catch (err) {
        res.status(400).json({message: err.message}) 
    }
}

module.exports = {aes256Encrypt, rsaEncrypt}