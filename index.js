//import dependencies
require("dotenv").config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session)
const pool = require("./db.js");

const sessionStore = new MySQLStore({},pool);

//setting up express server
const app = express();

//middleware
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000", "https://fastpayment-salesapp-front.vercel.app"],
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge:  24* 60 * 60 * 1000,
      //sameSite: false,
      httpOnly: true,
      //httpOnly: false,
      sameSite: 'none',
      secure: true
    }
  }))

//import routes
const signInRouter = require("./auth/sign-in.router");
const signUpRouter = require("./auth/sign-up.router");
const signOutRouter = require("./auth/sign-out.router");
const customersRouter = require("./customers/customers.router");
const codLocalIdRouter = require("./customers/codlocalid.router");
const addressRouter = require("./customers/address.router");
const inventoryRouter = require("./inventory/inventory.router");
const countryRouter = require("./customers/countries.router");
const stateRouter = require("./customers/states.router");
const municipalityRouter = require("./customers/municipalities.router");
const cityRouter = require("./customers/cities.router");
const parishRouter = require("./customers/parish.router");
const actividyRouter = require("./customers/activity.router");
const banksRouter = require("./customers/banks.router");
const productsRouter = require("./inventory/products.router");
const serialsRouter = require("./inventory/serials.router");
const usersRouter = require("./users/users.router");
const rolesRouter = require("./users/roles.router");
const salesRouter = require("./sales/sales.router");
const paymentsRouter = require("./sales/payment.router");
const generateCode = require("./auth/generate-code.js");
const verifyCode = require("./auth/verify-otp.router.js");

//middleware
/* const authenticated = async (req, res, next)=>{
  console.log(req.session);
  if(req.session.authenticated) next()
  else return res.status(401).send({
      ok: false, 
      error: "Not authenticated"
  });
}
const active = (req, res, next)=>{
  if(req.session.status == 3000) next()
  else return res.status(403).send({
      ok: false,
      error: "Not authorized"
  })
} */


//routes
app.use('/api/v1/auth/sign-in', signInRouter);
app.use('/api/v1/auth/sign-up', signUpRouter);
app.use('/api/v1/auth/sign-out', signOutRouter);
app.use('/api/v1/customers', 
//[authenticated,active], 
customersRouter);
app.use('/api/v1/new-inventory', inventoryRouter);
app.use('/api/v1/get-codlocalid', codLocalIdRouter);
app.use('/api/v1/listar-paises', countryRouter);
app.use('/api/v1/listar-estados', stateRouter);
app.use('/api/v1/listar-municipios', municipalityRouter);
app.use('/api/v1/listar-ciudades', cityRouter);
app.use('/api/v1/listar-parroquias', parishRouter);
app.use('/api/v1/new-address', addressRouter);
app.use('/api/v1/listar-actividades', actividyRouter);
app.use('/api/v1/listar-bancos', banksRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/seriales', serialsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/roles', rolesRouter);
app.use('/api/v1/sales', salesRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/auth/generate-otp', generateCode);
app.use('/api/v1/auth/verify-otp', verifyCode);
app.use('/api/v1/seriales/asignar-serial', verifyCode);

const port = process.env.PORT || 3001;

app.listen(port, ()=>{
    console.log(`Server is up and listening on port ${port}`)
})