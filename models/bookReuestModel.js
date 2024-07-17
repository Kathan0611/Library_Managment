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
        },
        onDelete: 'CASCADE', // this will enable cascading deletes
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
     },
     returnStatus:{
        type:DataTypes.STRING,             
        defaultValue:0
     },
     Day:{
         type:DataTypes.STRING,
         defaultValues:0
      },
      isdelete:{
         type:DataTypes.STRING,
         defaultValue:0
      }
})

// BookRequestModel.hasOne(BookModel,{ foreignKey: 'id' })
// BookModel.belongsTo(BookRequestModel,{ foreignKey: 'id' })
// 
// BookRequestModel.belongsTo(BookModel, { foreignKey: 'bookId', targetKey: 'id' });
BookRequestModel.belongsTo(userModel, {foreignKey:'userId', as :'user', onDelete: 'cascade' });
BookRequestModel.belongsTo(BookModel, { foreignKey: 'bookId', as: 'book', onDelete: 'cascade'}); 

module.exports=BookRequestModel;


// sequelize.sync().then(()=>{
//     console.log('Book-request table created')
// }).catch(err=>console.log(err))
