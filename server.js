require('dotenv').config();
const express=require('express');
const app=express();
const userRouter=require('./routers/userRouter')




app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use('/userRouter',userRouter);
// app.use('/boo')
// app.use('/bookRouter',bookRouter);////
// app.use('/transactionRouter',transactionRouter);
const PORT=process.env.PORT

app.listen(PORT,()=>{
    console.log(`server running on port 3000`)
})