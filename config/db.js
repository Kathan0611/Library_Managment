
const {Sequelize}= require('sequelize');


const sequelize= new Sequelize({
    database:'library',
    username:'root',
    password:'',
    host:'localhost',
    dialect:'mysql'
})

// const sequelize= new Sequelize('mysql://root:DtftHTjMYBlYQtpHBakjIbHJVscIfvnE@roundhouse.proxy.rlwy.net:26281/railway')
// roundhouse.proxy.rlwy.net:26281

sequelize.authenticate().then(()=>{
    console.log('connected established')
}).catch((error)=>
    {console.error('unable to connect database',error)})

module.exports=sequelize;