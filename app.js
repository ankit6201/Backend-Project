const express = require('express')
const dotenv  = require('dotenv')
const connectedDB = require('./config')
dotenv.config()

const authRouter = require('./routes/authRoutes')

connectedDB()
const app = express()

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use('/api/auth',authRouter)

const PORT =  process.env.PORT || 7000 

app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));