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
        res.status(200).json({message: "success", key: desKey.toString('hex').toUpperCase(), kcv: kcv.toUpperCase()});

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
            n: Buffer.from('00c9a63ec120481dab172026a2004f1356f8d4a9594404ea8d39eefe6d107323bf741a1213351675f20d90b43551dde630524b6f58408d9863589816e8bd9341022cf6f214afdbf6e6aa6f5828e53a4e9aa5d4207fb65d05b480c572d874adfddeb6ad64e8b46afe1a81284535725e95efb4d1bbdf7d60ffb6d9ecf8d38fc7d7826c0ce6c6cbe260f5dbe09be5cc5f5dcda47dd8715109fe66ce8cf70a8f97a7afff144d027a573c1811c1d28e3c19cbb9e35d2462ae071f0c2ee9ee6e310cede626e2df895f1db7abfbf22dbde3ab45b1e0f0223dbcb6b3a9400a49c2820790684c035f3ff1eae6ec513eeba375f27bff5b988b7b38d6e9151a4c44ec8a3aebb5', 'hex'),
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
            n: Buffer.from('00c9a63ec120481dab172026a2004f1356f8d4a9594404ea8d39eefe6d107323bf741a1213351675f20d90b43551dde630524b6f58408d9863589816e8bd9341022cf6f214afdbf6e6aa6f5828e53a4e9aa5d4207fb65d05b480c572d874adfddeb6ad64e8b46afe1a81284535725e95efb4d1bbdf7d60ffb6d9ecf8d38fc7d7826c0ce6c6cbe260f5dbe09be5cc5f5dcda47dd8715109fe66ce8cf70a8f97a7afff144d027a573c1811c1d28e3c19cbb9e35d2462ae071f0c2ee9ee6e310cede626e2df895f1db7abfbf22dbde3ab45b1e0f0223dbcb6b3a9400a49c2820790684c035f3ff1eae6ec513eeba375f27bff5b988b7b38d6e9151a4c44ec8a3aebb5', 'hex'),
            e: 65537,
            d: Buffer.from('2437cacfaf37a4b4851bce348cafa73e98c4c181f9f894143792987a085955d35e4c0c710cb8f3083dad7ee090cab53c7a9b77ed36f2f7aae84fb0d5aeaf131f0bea72c28a6f8ca2137c9a2e0635f9c6470099b1b69470a0e1fc14cb91f16a46a532f18be653cd3dff72b733894e39c9eb053ca44085ba88220e3106f6ad2324c4e6fb678298cde9164e15daa98056def2fb11e04d8ba3219c36554a2dec712e0887d0a6e0d2548d081dab65ad05bf33466ca820357d532019fe150b14badd91daa1b54fb7a239033b3883289499e0152ff6d5ff9c05fbe82c91b1bb0c3eb613971d39280281339a50cc3b3e609b9a983acbd2f6b14bb28b7758f536e83cc441', 'hex'),
            p: Buffer.from('00f3e23f16c4fb9d60e9f2ad426c56e1f452e39a1db07b03fba15164d9aea92a34753f82eeffc935dd4c201491056952869df248f78e452c7faa54c306a40590c3f3218d0823fb09ed7c51e657fcfffa89d61b85bad533323b0cbc8f573d55d142d42c5b495b55264a8ee65ee37fad6373c6d8ab30fd0d0109589b9cbc908f5131', 'hex'),
            q: Buffer.from('00d3aadadf5f84e8355b35a21153becacf99b83cd16388ad9eab5a4a63705ecbe596f873e4dc9785304be9a71fc33d65e322f83010e6010c3f06a24874ee5a96995046dbc56f6057ce74ee74bdca9a9372556d4923e2a110295b421ba95c4658a3c74a6d9c99d22534f181968b8d39c84690a34dd343acc460031994a3789441c5', 'hex'),
            dmp1: Buffer.from('32cbc2bc295706d672a3baf684be2bddc98de241a0ca5e70008f8563d97f1e6d42a671ccf9b59ce474c091c80aca7f07cec9f1ecadd3368b789ca2ea352b7b9574845e6d7da101d656f86ff38f9c79405039f7468cb55716f976249cd50794c8488cdc8e90d9515a621d155268fb6225711b1bbcde57e109634d35fe0855f161', 'hex'),
            dmq1: Buffer.from('378ed7185e8812333f179acc9580b4d73cf000f6acfb8926e6af326b5b69667782e2fff8887634fd724f88106c3cc76b911837f597899adf482c7c7c44bbfe5f8b94adc6eaef0cdd22101d105c07aac00df03b8c71c5f8ea020c1e1a9c1fd2d05a550ce457f3b2d46cb7a8fe4439707a2528d81aa5dec944b24b9a9a35e22449', 'hex'),
            coeff: Buffer.from('00b3425609460402773894637d658f58f37e687e842408257d01b5b4c830f1ac130d2d68563c11da7fda3c44ac71c7cafcbd51c190b0ee3c75fcf6719025f3f7643917d9c1cddb0c5c35ebcb374a662ccd247dee3ff53f717c02b2e6236036e90aff02e8f7605b31ad700728223016d257b5070cb58db684a7ecf37c45e77568e9', 'hex')
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