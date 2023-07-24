const express = require('express')
const app = express()
const port = process.env.PORT||5000
const User = require('./Routing/user')
const cors = require('cors')
const admin = require('./Routing/admin')

app.use(cors())
app.use('/user',User)
app.use('/admin',admin)
app.get('/',(req,res)=>{
    res.send('working')

})


app.listen(port,()=>{
    console.log(`in port ${port}`)
})