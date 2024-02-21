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

//routes


const port = process.env.PORT || 3001;

app.listen(port, ()=>{
    console.log(`Server is up and listening on port ${port}`)
})