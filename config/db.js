
const {Sequelize}= require('sequelize');


// const sequelize= new Sequelize({
//     database:'library',
//     username:'root',
//     password:'',
//     host:'localhost',
//     dialect:'mysql'
// })

const sequelize= new Sequelize('mysql://root:lIninmNKJBElaIhVCVvcTLvsfpCMvPxO@viaduct.proxy.rlwy.net:56019/railway')


sequelize.authenticate().then(()=>{
    console.log('connected established')
}).catch((error)=>
    {console.error('unable to connect database',error.message)})

module.exports=sequelize;