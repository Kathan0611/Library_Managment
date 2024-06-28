require('dotenv').config();
const express=require('express');
const app=express();
const userRouter=require('./routers/userRouter')
const categoryRouter=require('./routers/categoryRouter')
const bookRouter=require('./routers/bookRouter')




app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use('/bookRouter',bookRouter);
app.use('/userRouter',userRouter);
app.use('/categoryRouter',categoryRouter);

const PORT=process.env.PORT

app.listen(PORT,()=>{
    console.log(`server running on port 3000`)
})