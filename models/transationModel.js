const {DataTypes}=require('sequelize');
const sequelize=require('./../config/db');

const  transactionModel=sequelize.define('transactionModel',{
      userId:{
         type:DataTypes.STRING,
         references:{
            model:userModel,
            key:'id'
         }
      },
      bookId:{
        type:DataTypes.STRING,
        references:{
            model:bookModel,
            key:'id'
        }
      },
      borrowdate:{
        type:DataTypes.DATE,
        allowNull:true
      },
      returndate:{
        type:DataTypes.DATE,
        allowNull:true
      }

})

module.exports=transactionModel;

sequelize.sync().then(()=>{
    console.log(`transaction table is created `)
}).catch((err)=>console.log('unable to create table'+err))