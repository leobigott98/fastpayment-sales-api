const getToken = require("../db/db")

const tranredToken = (req, res, next) => {
    const {timestamp} = getToken()[0]
    const current = Date.now()
    const tokenTime = Number(timestamp)
    const elapsed = (current - tokenTime) / (3600 * 1000)

    if (elapsed > 4){
        const body = {
            login: process.env.TRANRED_USER,
            password: process.env.TRANRED_PASSWORD
        }
    
        try{
            fetch(`${process.env.TRANRED_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
            .then(async(result)=>{
                if(result.ok){
                    const json = await result.json()
                    deleteTokens();
                    saveToSQLite(json.access_token, Date.now().toString())
                    req.tranredToken = json.access_token
                    next()
                }
            })
        }catch(error){
            console.log(error)
        }    
    }
    next()

}

module.exports = tranredToken;