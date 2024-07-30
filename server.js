require('dotenv').config();
const express=require('express');
const cors = require('cors')


const userRouter= require('./routers/userRouter');
const categoryRouter=require('./routers/categoryRouter');
const bookRouter=require('./routers/bookRouter');

const app=express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);


app.use(cors());
app.use(express.json({limit:'50mb'})); 
app.use(express.urlencoded({extended:true,limit: "50mb"}))

          
app.use('/bookRouter',bookRouter);        
app.use('/userRouter',userRouter);
app.use('/categoryRouter',categoryRouter);    
   

const PORT=process.env.PORT


io.on('connection', (socket) => {
    socket.emit('connect', {message: 'a new client connected'})
});

// const socket = io();

// socket.on('connect', () => {
//     console.log('Connected to server');
// });

// socket.on('bookCreated', (data) => {
//     console.log('New Book Created:', data.message);
//     console.log('Book Data:', data.data);
//     // Handle the new book data as needed
// });

app.listen(PORT,()=>{
    console.log(`server running on port 3000`)        
})