const aes256 = require('aes256')

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

module.exports = {aes256Encrypt}