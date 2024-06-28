const {DataTypes}=require('sequelize');
const sequelize = require('./../config/db');
const BookModel = require('./bookModel');
const userModel= require('./userModel');


const BookRequestModel= sequelize.define('BookRequestModel',{
     userId:{
        type:DataTypes.INTEGER,
        allowNull:true,
        references:{
            model:userModel,
            key:'id'
        }
     },
     bookId:{
        type:DataTypes.INTEGER,
        allowNull:true,
        references:{
            model:BookModel,
            key:'id'
        }
     },
     isBookApproved:{
        type:DataTypes.ENUM,
        allowNull:true,
        values:['pending','approved','rejected'],
        defaultValue:'pending'
    },
     startDate:{
        type:DataTypes.DATEONLY,
        allowNull:true
     },  
     endDate:{
        type:DataTypes.DATEONLY,
        allowNull:true
     } ,
     returnStatus:{
        type:DataTypes.STRING,             
        defaultValue:0
     }
})

module.exports=BookRequestModel;
[]
sequelize.sync().then(()=>{
    console.log('Book-request table created')
}).catch(err=>console.log(err))