const express =require('express')
const app = express()
app.get('/',(req,res)=>res.json({message: 'Heloo World'}))
app.listen(process.env.PORT || 3000)