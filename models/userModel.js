const { DataTypes } = require('sequelize');
const sequelize = require('./../config/db')

const userModel = sequelize.define('userModel', {
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    birthDate: {
        type: DataTypes.DATEONLY
    },
    Address: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            address: null,
            city: null,
            state: null,
            country: null,
            pincode: null,
            landmark: null,
        }
    },
    roles: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['admin', 'librarian', 'user']
    },
    Image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    BannerImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isLogin: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    isdeleted: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    // isApproved:{
    //     type:DataTypes.INTEGER,
    //     allowNull:false,
    //     defaultValue:0
    // }
}, {
    timestamps: true
})

module.exports = userModel;

sequelize.sync().then(() => {
    console.log(`user table is created `)
}).catch((err) => console.log('unable to create table' + err))