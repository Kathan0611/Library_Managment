const { DataTypes } = require('sequelize');
const moment = require('moment-timezone');

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
        allowNull: false
    },
    mobilenum: {
        type: DataTypes.INTEGER
    },
    roles: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue:'user'
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
    otp: {
        type:DataTypes.STRING,
        allowNull:true
    },
    otpExpiration:{ 
        type: DataTypes.DATE,
        allowNull:true,
        
    }

    
}, {
    timestamps: true
})

module.exports = userModel;
// console.log(moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'))
sequelize.sync().then(() => {
    console.log(`user table is created `)
}).catch((err) => console.log('unable to create user table' + err))