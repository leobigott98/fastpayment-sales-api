//import dependencies
const express = require("express");
const pool = require("../db");
const fs = require("fs");
const multer = require("multer");
const nodemailer = require("nodemailer");

//import middlewares
const auth = require("../middlewares/auth");
const {admin, sales, sales_finance} = require("../middlewares/roles");
const pdfprinter = require("./pdfprinter");

//setup the router for express
const router = express.Router();

//Set up the route handlers

//Get all sales
router.get("/", [auth, sales], async (req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user
    
    try {
        const result = await promisePool.query('CALL sp_get_sales(?)', [user_id]);

        res.status(200).json({
            ok: true,
            result: result[0][0]
        });
        
    } catch (error) {
        console.log(error)
        res.status(500).send({
            ok: false, 
            result: 'Not sure what happened :('
        })
    }
    
});


//Add a new sale
router.post("/", [auth, sales], async (req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user
    const {
        v_cusm_id, 
        v_sale_serie,
        v_sale_total} = req.body;

    try {
        const result = await promisePool.query('CALL sp_add_sale(?,?,?,?)', [user_id, v_cusm_id, v_sale_serie, v_sale_total ]);

        res.status(200).json({
            ok: true,
            result: result[0][0]
        });
        
    } catch (error) {
        res.status(500).send({
            ok: false, 
            result: 'Not sure what happened :('
        })
    }
    
});

//Add a new sale detail
router.post("/detail", [auth, sales], async (req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user;

    const { v_sale_id,
            v_prod_id,
            v_salesdt_qty,
            v_prod_price,
            v_plan_id
            } = req.body;

    try {
        const result = await promisePool.query('CALL sp_add_saledt(?,?,?,?,?,?)', [ user_id, v_sale_id, v_prod_id, v_plan_id, v_salesdt_qty, v_prod_price  ]);

        res.status(200).json({
            ok: true,
            result: result[0][0]
        });
        
    } catch (error) {
        res.status(500).json({error: error.message})
    }
    
});

// get customer details from a sale
router.get('/customer/:id', [auth, sales_finance], async(req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user;
    const {id} = req.params;

    try{
        const result = await promisePool.query('CALL sp_get_commerce_tr(?,?)', [id, user_id])

        if(result[0][0][0].error_num){
            res.status(400).json({
                success: false, 
                result: result[0][0]
            })
        }else{
            res.status(200).json({
                success: true,
                result: result[0]
            })
        }

       
    }catch(err){
        res.status(400).json({
            success: false,
            error: err,
            message: err.message
        })
    }
})

// get serial from a sale
router.get('/serials/:id', [auth, sales_finance], async(req, res)=>{
    const promisePool = pool.promise();

    const {user_id} = req.user;
    const {id} = req.params;

    try{
        const result = await promisePool.query('CALL sp_get_serials_tr(?,?)', [user_id, id])
        //res.status(200).json({result: result})

        if(result[0][0][0].error_num){
            res.status(400).json({
                success: false, 
                result: result[0][0]
            })
        }else{
            res.status(200).json({
                success: true,
                result: result[0][0]
            })
        }

       
    }catch(err){
        res.status(400).json({
            success: false,
            error: err,
            message: err.message
        })
    }
})

// assign account number to a serial
router.post('/account', [auth, sales_finance], async (req,res)=>{
    const {user_id} = req.user;
    const {v_sale_id, v_bank_id, v_acct_number, v_serial_num} = req.body;

    console.log(req.body)
    try {
        const promisePool = pool.promise();
        const response = await promisePool.query('CALL sp_add_account(?,?,?,?,?)', [user_id, v_sale_id, v_serial_num, v_bank_id, v_acct_number]);
        res.status(200).json(response[0][0][0]);
        
    } catch (error) {
        res.status(400).json(error);
    }


})

router.get('/detail/:id', [auth, sales_finance], async(req, res)=>{
    const {id} = req.params
    const sqlQuery = `SELECT t_saledt.sale_id, t_saledt.saledt_id, t_product.prod_brand, t_product.prod_model, t_product.prod_price, t_saledt.saledt_qty, t_plans.plan_desc, t_plans.plan_amount, t_sales.sale_dreg, t_sellers.sell_fee, t_user.user_email, t_user.user_name, t_user.user_last
    FROM t_saledt
    INNER JOIN t_product ON t_saledt.prod_id = t_product.prod_id
    INNER JOIN t_sales ON t_saledt.sale_id = t_sales.sale_id
    LEFT JOIN t_plans ON t_saledt.plan_id = t_plans.plan_id
    INNER JOIN t_sellers ON t_sales.sell_id = t_sellers.sell_id
    INNER JOIN t_user ON t_sellers.user_id = t_user.user_id
    WHERE t_saledt.sale_id = ?;`

    try {
        const promisePool = pool.promise();
        const response = await promisePool.query(sqlQuery, [id]);
        
        res.status(200).json(response[0]);

    } catch (error) {
        res.status(400).json(error.message)
    }
})

//Generate PDF doc and send it to email
router.get("/pdf/:id", [auth, sales], async (req, res)=>{
    const promisePool = pool.promise();
    const sqlQuery = `CALL sp_get_sale_info(?)`
    var total = 0;

    const { id } = req.params;

    try {
        const result = await promisePool.query(sqlQuery, [ id ]);
        if(result[0][0].length === 0){
            res.status(400).json({
                ok: true,
                result: 'SIN RESULTADO'
            });
            
        }else{
            const {salesperson_name, salesperson_last, sale_serie, cusm_namec, rif_cliente, tlf_movil, tlf_local, ciud_desc, add_street, add_level, add_ofic, parr_desc, municp_desc, estad_desc, sale_dreg, salesperson_email, percon_email, percon_name, percon_last} = result[0][0][0]
            const detail = [...result[0][1]]
            detail.map((sale)=>{
                total += (sale.saledt_qty) * (sale.prod_price)
            })
            
            //Create PDF and store it in disk
            pdfprinter.makePDF(salesperson_name, salesperson_last, sale_serie, cusm_namec, rif_cliente, tlf_movil, tlf_local, ciud_desc, add_street, add_level, add_ofic, parr_desc, municp_desc, estad_desc, detail, total, sale_dreg)
            
            // create email transporter
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true, // Use `true` for port 465, `false` for all other ports
                auth: {
                    user: process.env.SMTPUSER,
                    pass: process.env.SMTPPASSWORD,
                },
            });

            const html = `<body style="padding: 0 24px;margin: 0;">
                            <div style="padding: 0 24px;margin: 0;color: black;display: flex;justify-content: center;">
                                <img src="https://fastpay-sales-api-kxzebhhsua-uc.a.run.app/LogotipoFastPayment-03.png" alt="Logo FastPayment" width="500vw" style="margin: 0; padding: 0;"/>
                            </div>
                            <h1 style="margin: 0; display: flex; justify-content: center;">Cotización de Venta para ${cusm_namec}</h1>
                            <p>Estimado Sr(a). ${percon_name} ${percon_last}</p>
                            <div style="display: flex;">
                                <p>Adjunto a este correo encontrará la cotización de venta para la empresa ${cusm_namec}.</p>
                            </div>
                        </body>`

            // async..await is not allowed in global scope, must use a wrapper
            async function main() {
                // send mail with defined transport object
                const info = await transporter.sendMail({
                from: '"Leo Bigott" <l.bigott@fastpayment.com.ve>', // sender address
                to: `${percon_email}, ${salesperson_email}`, // list of receivers
                subject: `Cotización FastPayment para ${cusm_namec}`, // Subject line
                //text: "Hello world?", // plain text body
                html: html, // html body,
                attachments: {   // stream as an attachment
                    filename: `Cotización_Fastpayment_${sale_serie}.pdf`,
                    content: fs.createReadStream(`../API/sales/docs/CotizacionFastPayment-${sale_serie}.pdf`)
                },
                });
            
                console.log("Message sent: %s", info.messageId);
                // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email> 
            }

            main().catch(console.error);
            
            res.status(200).json({
                ok: true,
                result: result[0]
            });
        }

        
        
    } catch (error) {
        console.log(error)
        res.status(500).json({error: error.message})
    }
    
});

//upload photo
const photosMiddleware = multer({ dest: "uploads/" });
router.post("/upload", [auth, sales_finance, photosMiddleware.array("photos", 10)], (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const { path, originalname } = req.files[i];
      const parts = originalname.split(".");
      const ext = parts[parts.length - 1];
      const newPath = path + "." + ext;
      fs.renameSync(path, newPath);
      uploadedFiles.push(newPath.replace("uploads\\", ""));
    }
    res.json(uploadedFiles);
  });


//export the router
module.exports = router;