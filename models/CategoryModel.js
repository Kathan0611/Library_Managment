const {DataTypes}=require('sequelize');
const sequelize= require('../config/db');
const BookModel = require('./bookModel');

const CategoryModel=  sequelize.define('CategoryModel',{
  // id: {
  //   type: DataTypes.INTEGER,
  //   primaryKey: true,
  //   autoIncrement: true,
  //   },
     categoryName:{
        type:DataTypes.STRING,
        allowNull:false
      }
},{
    timestamps: true
})

// CategoryModel.hasMany(BookModel,{foreignKey:'bookId',as:'book'})

module.exports=CategoryModel;
  
// CategoryModel.sync({alter:true}).then(()=>{  
//     console.log("Category table Created")
//   }).catch((err)=>{
//     console.log('error', err)
//   });
