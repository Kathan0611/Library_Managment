const {DataTypes}=require('sequelize');
const sequelize= require('../config/db');

const CategoryModel=  sequelize.define('CategoryModel',{
      categoryName:{
        type:DataTypes.STRING,
        allowNull:false
      }
},{
    timestamps: true
})


module.exports=CategoryModel;
// sequelize.sync().then(()=>{  
//     console.log("Category table Created")
//   }).catch((err)=>{
//     console.log('error', err)
//   });
