
const {Sequelize}= require('sequelize');


// const sequelize= new Sequelize({
//     database:'library',
//     username:'root',
//     password:'',
//     host:'localhost',
//     dialect:'mysql'
// })

const sequelize= new Sequelize('mysql://root:ZkzxfsqoIfKYlposWuxgUrLFHDiCYvFh@autorack.proxy.rlwy.net:35883/railway')


sequelize.authenticate().then(()=>{
    console.log('connected established')
}).catch((error)=>
    {console.error('unable to connect database',error.message)})

module.exports=sequelize;
