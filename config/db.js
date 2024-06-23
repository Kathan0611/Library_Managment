
const {Sequelize}= require('sequelize');


const sequelize= new Sequelize({
    database:'society',
    username:'root',
    password:'',
    host:'localhost',
    dialect:'mysql',
    port:'2811'
})

sequelize.authenticate().then(()=>{
    console.log('connected established')
}).catch((error)=>
    {console.error('unable to connect database',error)})

module.exports=sequelize;

module.exports=sequelize;
