const aes256 = require('aes256');
const NodeRSA = require('node-rsa');
const fs = require('fs');
const crypto = require('crypto');

// Function to generate a random Double-Length (112-bit effective) 3DES key (16 bytes total)
function generateDoubleLength3DESKey() {
    // Double-length 3DES uses two 64-bit DES keys (112 bits effective security).
    // We generate 16 bytes to include parity bits (8 bytes per DES key).
    const key = crypto.randomBytes(16); // 16 bytes (128 bits with parity)
    return key;
};

// Function to generate a KCV (Key Check Value)from a 3DES key
function generateKCV(desKey) {
    // Encrypt 8 bytes of 0x00 with 3DES using the KEK
    const iv = Buffer.alloc(8, 0); // Initialization vector of all zeros

    // Create a DES-EDE cipher in ECB mode using the key
    const cipher = crypto.createCipheriv('des-ede-cbc', desKey, iv);

  
    // Encrypt 8 bytes of zeros
    const encrypted = cipher.update(Buffer.alloc(8, 0));

    cipher.final(); // Complete the encryption

    // Return the first 3 bytes of the encrypted result as the KCV
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
};

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

const remoteKeyRsaEncrypt = (req, res) => { 
    // Load the public key in PEM format
    const publicKeyPem = fs.readFileSync('./certs/test_public_key.pem', 'utf8');

    try {
        // Data to concatenate the KEK with 
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
        

        // Concatenate data
        const toEncrypt = prefix + desKey.toString('hex') + sufix;
        //const toEncrypt = '0002E2709F1B6394ACFA5DBB0DC979973955B855E1457D2466CDAB79B1EE9F04163CBFCB2911B02FF3BFEA593D4826B4368EDD09F84C1591465B89F17A67EBB5BF74799D2EF0CAB0BB2457CA2315084A58D8C8E2F50970FCD2C74D6FF7CCD73E692A310A5E1C8664ADF3D5FE448FB2C457DE7370ABC22F59ED57284CB4CE84493F78C61B3ED59C1185A3E10BD69F83F68FD2FDF6F5CD648C82A7E83B966635503A874EBC6D6CA34876E6DC38813D80C313F391A3056C7A091234C667DFC2A07A7311C9BCAEDC9003CC0F0FE33FC7D8D40A581B351D0664EBF71F67C4190862DB9F00301C0410BB043F3570A15C94C68AB7CD257380AD04080000000000000000'
        console.log('Data to encrypt (hex):', toEncrypt);
        console.log('Data to encrypt length:', toEncrypt.length);

        // Convert to binary buffer
        const binaryInput = Buffer.from(toEncrypt, 'hex');
        if (binaryInput.length !== 256) {
            throw new Error(`Data to encrypt must be 256 bytes, but got ${binaryInput.length} bytes`);
        }

        // Encrypt with RSA
        const encrypted = crypto.publicEncrypt(
            {
                key: publicKeyPem,
                padding: crypto.constants.RSA_NO_PADDING,
            },
            binaryInput
        );
        
        console.log('Encrypted text length:', encrypted.length);
        res.status(200).json({ 
            message: 'success', 
            kek: desKey.toString('hex'), 
            kcv: kcv.toUpperCase(), 
            encryptedMessage: encrypted.toString('hex').toUpperCase() 
        });     
    } catch (err) {
        console.error('Encryption error:', err.message);
        res.status(500).json({ message: err.message }); 
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