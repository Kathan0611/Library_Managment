const {DataTypes}=require('sequelize');
const sequelize= require('./../config/db')

const userModel= sequelize.define('userModel',{
    name:{
     type:DataTypes.STRING
    },
    email:{
        type:DataTypes.STRING
    },
    password:{
       type:DataTypes.STRING 
    },
    birthDate:{
        type:DataTypes.DATEONLY
    },
    mobilenum:{
        type:DataTypes.INTEGER
    },
    Address:{
      type:DataTypes.JSON,
      allowNull:true,
      defaultValue:{
        address:null,
        city:null,
        state:null,
        country:null,
        pincode:null,
        landmark:null,
      }
    },
    roles:{
           type:DataTypes.ENUM,
           allowNull:false,
           values:['admin','librarian','user']
        },
       Image:{
        type:DataTypes.BLOB,
        allowNull:false, 
         },
       BannerImage:{
        type:DataTypes.BLOB,
        allowNull:true
        },
       isLogin: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
     isdeleted:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0
    }
},{
    timestamps:true
})

module.exports=userModel;

sequelize.sync().then(()=>{
    console.log(`user table is created `)
}).catch((err)=>console.log('unable to create table'+err))