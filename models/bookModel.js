const { DataTypes } = require('sequelize');
const sequelize = require('./../config/db');
const userModel = require('./userModel')

const BookModel = sequelize.define('BookModel', {
    title: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING
    },
    author: {
        type: DataTypes.STRING
    },
    book_added_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: userModel,
            key: 'id'

        }
    },
    BookNo: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
    Image: {
        type: DataTypes.BLOB,
        allowNull: true
    },
    publishDate: {
        type: DataTypes.DATE
    }
}, {
    timestamps: true
})

module.exports = BookModel;

sequelize.sync().then(() => {
    console.log(`Book table is created `)
}).catch((err) => console.log('unable to create table' + err))