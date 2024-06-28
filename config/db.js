
const {Sequelize}= require('sequelize');


const sequelize= new Sequelize({
    database:'library',
    username:'root',
    password:'',
    host:'localhost',
    dialect:'mysql'
})

sequelize.authenticate().then(()=>{
    console.log('connected established')
}).catch((error)=>
    {console.error('unable to connect database',error)})

module.exports=sequelize;