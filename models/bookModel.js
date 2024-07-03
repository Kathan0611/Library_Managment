const { DataTypes, STRING } = require('sequelize');
const sequelize = require('./../config/db');
const CategoryModel = require('./CategoryModel');
const userModel= require('./userModel');


const BookModel = sequelize.define('BookModel', {
    BookName: {
        type: DataTypes.STRING,
        allowNull:true
    },
    Category: {
        type: DataTypes.INTEGER,
        allowNull:true,
        references:{
            Model:CategoryModel,
            key:'id'
        }
    },
    ISBN:{
       type:DataTypes.STRING,
       allowNull:true
    },
    Author: {
        type: DataTypes.STRING,
        allowNull:true
    },
    TotalQuantity:{
       type:DataTypes.INTEGER,
       allowNull:true,
    },
    Remaining_Quantity:{
        type:DataTypes.INTEGER,
        allowNull:true,
        defaultValue:100
    },
    Price: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Image: {    
        type: DataTypes.STRING,
        allowNull: true 
    },
    Publisher: {
        type: DataTypes.STRING,
        allowNull:true
    },
    Availability:{
        type:DataTypes.ENUM,
        allowNull:true,
        values:['Available','Not Available'],
        
    }
}, {
    timestamps: true,

}) 


CategoryModel.hasMany(BookModel, { foreignKey: 'Category' });
BookModel.belongsTo(CategoryModel, { foreignKey: 'Category' });

module.exports = BookModel;

sequelize.sync().then(() => {
    console.log(`Book table is created `)
}).catch((err) => console.log('unable to create book table' + err.message))