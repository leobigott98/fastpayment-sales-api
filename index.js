//import dependencies
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

//setting up express server
const app = express();

//middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

//import routes
const signInRouter = require("./auth/sign-in.router");
const signUpRouter = require("./auth/sign-up.router");
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

//routes
app.use('/api/v1/auth/sign-in', signInRouter);
app.use('/api/v1/auth/sign-up', signUpRouter);
app.use('/api/v1/customers', customersRouter);
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


const port = process.env.PORT || 3001;

app.listen(port, ()=>{
    console.log(`Server is up and listening on port ${port}`)
})