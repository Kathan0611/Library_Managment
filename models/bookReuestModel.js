const {DataTypes}=require('sequelize');
const sequelize = require('./../config/db');
const BookModel = require('./bookModel');
const userModel= require('./userModel');

const BookRequestModel= sequelize.define('BookRequestModel',{
   id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
     },
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
// BookModel.belongsTo(BookRequestModel,{ foreignKey: 'bookId' ,as:'book'})
// 
// BookRequestModel.belongsTo(BookModel, { foreignKey: 'bookId', targetKey: 'id' });
BookRequestModel.belongsTo(userModel, {foreignKey:'userId', as :'user'  });
BookRequestModel.belongsTo(BookModel, { foreignKey: 'bookId', as: 'book'}); 


module.exports=BookRequestModel;


// sequelize.sync({alter:true}).then(()=>{
//     console.log('Book-request table created')
// }).catch(err=>console.log(err))
