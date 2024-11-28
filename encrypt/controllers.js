const aes256 = require('aes256');
const NodeRSA = require('node-rsa');
const fs = require('fs');
const publicKey = fs.readFileSync('./certs/ccr_publicKey.pem', 'utf8');
const crypto = require('crypto');

// Function to generate a random Double Length (112-bit) 3DES key
function generateDoubleLength3DESKey() {
    // 3DES uses two 64-bit keys, but only 56 bits of each are used (due to parity bits)
    // We need to generate 112 bits (14 bytes)
    const key = crypto.randomBytes(16); // 112 bits = 14 bytes
    return key;
};

// Function to generate KCV (Key Check Value)
function generateKCV(key) {
    // Create a DES-EDE cipher in ECB mode using the key
    const cipher = crypto.createCipheriv('des-ede', key, null);
  
    // Encrypt 8 bytes of zeros
    const encrypted = cipher.update(Buffer.alloc(8, 0x00));
  
    // KCV is the first 3 bytes (6 hex digits) of the encrypted result
    return encrypted.slice(0, 3).toString('hex');
};

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

/* const rsaEncrypt = (req, res)=>{
    try {
        const {input} = req.body;
        const key = new NodeRSA(publicKey);
        const encrypted = key.encrypt(input, 'base64');
        res.status(200).json({message: 'success', encrypted: encrypted});
        
    } catch (err) {
        res.status(400).json({message: err.message}) 
    }
} */

const generateKEK = (req, res) => {

    try{
        // Generate the key
        const desKey = generateDoubleLength3DESKey();
        const kcv = generateKCV(desKey);
        res.status(200).json({message: "success", key: desKey.toString('hex'), kcv: kcv});

    }catch(err){
        res.status(500).json({message: err.message});
    }
};

const remoteKeyRsaEncrypt = (req, res)=>{

    try {
        const header = process.env.CCR_KEK_HEADER;
        const constantValue0 = process.env.CCR_KEK_CONSTANT_VALUE_0;
        const derEncoding = process.env.CCR_KEK_DER_ENCODING;
        const constantValue1 = process.env.CCR_KEK_CONSTANT_VALUE_1;
        const constantValue2 = process.env.CCR_KEK_CONSTANT_VALUE_2;
        const initVector = process.env.CCR_KEK_INIT_VECTOR;
        const prefix = header + constantValue0 + derEncoding;
        const sufix = constantValue1 + constantValue2 + initVector;
        const desKey = generateDoubleLength3DESKey();
        const kcv = generateKCV(desKey);
        const toEncrypt = prefix + desKey.toString('hex') + sufix;
        const key = new NodeRSA();
        console.log(toEncrypt);
        key.importKey({
            n: Buffer.from(process.env.CCR_RSA_PUBLIC_KEY, 'hex'),
            e: 65537,
        }, 'components-public');
        //const encrypted = crypto.publicEncrypt()
        const encryptedHex = key.encrypt(toEncrypt, 'hex');
        res.status(200).json({message: 'success', kek: desKey.toString('hex'), kcv: kcv, encryptedMessage: encryptedHex});
        
    } catch (err) {
        res.status(500).json({message: err.message}) 
    }
};

const rsaEncrypt = (req, res)=>{

    try {
        const {input} = req.body;
        //const toEncrypt = prefix + desKey.toString('hex') + sufix;
        const key = new NodeRSA();
        key.importKey({
            n: Buffer.from(process.env.TEST_PUBLIC_KEY_N, 'hex'),
            e: 65537,
        }, 'components-public');
        //const encrypted = crypto.publicEncrypt()
        const encryptedHex = key.encrypt(input, 'hex');
        res.status(200).json({message: 'success', encryptedMessage: encryptedHex});
        
    } catch (err) {
        res.status(500).json({message: err.message}) 
    }
};

const rsaDecrypt = (req, res)=>{

    try {
        const {input} = req.body;
        const key = new NodeRSA();
        key.importKey({
            n: Buffer.from(process.env.TEST_PRRIVATE_KEY_N, 'hex'),
            e: 65537,
            d: Buffer.from(process.env.TEST_PRRIVATE_KEY_D, 'hex'),
            p: Buffer.from(process.env.TEST_PRRIVATE_KEY_P, 'hex'),
            q: Buffer.from(process.env.TEST_PRRIVATE_KEY_Q, 'hex'),
            dmp1: Buffer.from(process.env.TEST_PRRIVATE_KEY_DMP1, 'hex'),
            dmq1: Buffer.from(process.env.TEST_PRRIVATE_KEY_DMQ1, 'hex'),
            coeff: Buffer.from(process.env.TEST_PRRIVATE_KEY_COEFF, 'hex')
        }, 'components');
        //const encrypted = crypto.publicEncrypt()
        const decryptedHex = key.decrypt(Buffer.from(input, 'hex'));
        const decryptedMessage = decryptedHex.toString();
        res.status(200).json({message: 'success', decryptedMessage: decryptedMessage});
        
    } catch (err) {
        res.status(500).json({message: err.message}) 
    }
};

module.exports = {aes256Encrypt, rsaEncrypt, remoteKeyRsaEncrypt, generateKEK, rsaDecrypt};