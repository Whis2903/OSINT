const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const app = express();

// Load environment variables from .env file
dotenv.config();
const PORT = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors({ 
    origin : 'http://localhost:5173'
}));

//default route
app.get('/', (req,res)=>{
    res.send("Welcome to OSINT API");
})

// Routes
app.use('/api', require('./routes'));


app.listen(PORT, ()=>{
    console.log(`Server running at port ${PORT}`)
})