const userModel = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const bcrypt=require('bcrypt');
const { Op } = require('sequelize');
const jwt=require('jsonwebtoken');

exports.signup = catchAsync(async (req, res) => {

    const { name, email, password, birthDate, mobilenum, Address, roles } = req.body;
    console.log(Address,"klklkl")
    const {Image,BannerImage}=req.files;
    console.log(Image,BannerImage)
    const ImagneName=Image.map((Image)=>Image.filename).join('');
    const BannerImageName=BannerImage.map((BannerImage)=>BannerImage.filename).join('');
  
    console.log(name,email,password,birthDate,mobilenum,Address,roles,Image,BannerImage)
    if (!name || !email || !password || !birthDate || !mobilenum || !roles ) {
        return res.status(422).json({
            error: true,    
            statusCode: 422,
            message: "please required all field to fillup"
        })
    }
    else {
        console.log(email)
        const existedUser = await userModel.findOne({where:{ email: email }})
        console.log(existedUser)
        if (existedUser) {
            return res.status(400).json({
                error: true,
                statusCode: 400,
                message: 'User already exist'
            })
        }
        else {
            const newUser = await userModel.create({
                name,
                email,
                password:bcrypt.hashSync(password, 10),
                birthDate,
                mobilenum,
                Image: ImagneName,
                BannerImage: BannerImageName,
                Address,
                roles
            })

            if (!newUser) {

                return res.status(400).json({
                    error: true,
                    statusCode: 400,
                    message: 'New User is not created'
                })
            }

            else {
                
                return res.status(201).json({
                    error: false,
                    statusCode: 201,
                    message: 'Successfully Created User',
                    data: newUser
                })
            }
        }
    }
});

exports.login = catchAsync(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(422).json({
            error: true,
            statusCode: 422,
            message: 'please required all filed to fillup'
        })
    }
    else {

        const existUser = await userModel.findOne({ where: { [Op.or]: [{ email: username }, { name: username }] } });
    
        if (!existUser) {

            return res.status(404).json({
                error: true,
                statusCode: 404,
                message: 'user not found'
            })
        }
        else {
            const token = jwt.sign({ id: existUser.id }, process.env.SECRET_KEY, {
                expiresIn: "1d",
              });
            
              if (!token) {
                return res.status(400).json({ message: "token is not defined" });
              }
      
            const validatePassword= await bcrypt.compare(password,existUser.password);

             if(!validatePassword) {
                return res.status(401).json({
                    error:false,
                    statusCode:401,
                    message:'Unauthorized User'
                })
             }
             const updateLoginStatus = await userModel.update({
            isLogin: true // Set isLogin to true for clarity
             },{
                where: { id: existUser.id }
             })
  
             if (!updateLoginStatus) {
                return res.status(400).json({
                    error: true,
                    statusCode: 400,
                    message: 'User is not logged in'
                })
            }
            else{
                existUser.isLogin=updateLoginStatus[0];

            return res.status(200).json({
                error: true,
                statusCode: 200,
                message: 'user logging successfully',
                data: existUser,
                token
            })
        }
    }
    }
})

exports.getAllUser = catchAsync(async (req, res) => {

    const getAllusers = await userModel.findAll({});

    if (!getAllusers.length>0) {
        return res.status(404).json({
            error: true,
            statusCode: 404,
            message: 'Users not getting Successfully'
        })
    }
    else {
        return res.status(200).json({
            error: false,
            statusCode: 200,
            message: 'getAllUser Successfully',
            data: getAllusers
        })
    }
})

exports.singleUser = catchAsync(async (req, res) => {

    const userId = req.params;
    const singleuser = await userModel.findByPk(id);

    if (!singleuser) {
        return res.status(404).json({
            error: true,
            statusCode: 404,
            message: 'user not found'
        })
    }
    else {

        return res.status(200).json({
            error: false,
            statusCode: 200,
            message: 'User get Successfully',
            data: singleuser
        })
    }
})

exports.updateUser = catchAsync(async (req, res) => {

    const userId = req.params;
    const { name, email, password, birthDate, mobilenum, Addresses } = req.body
    const updateFields = {};
    if (!userId || !name || !email || !password || !birthDate || !mobilenum || !Addresses) {
        return res.status(422).json({
            error: true,
            statusCode: 422,
            message: 'All field are required'
        })
    }
    else {

        if (name) {
            updateFields.name = name;
        }
        if (email) {
            updateFields.email = email;
        }
        if (password) {
            updateFields.password = password;
        }
        if (birthDate) {
            updateFields.birthDate = birthDate;
        }
        if (mobilenum) {
            updateFields.mobilenum = mobilenum;
        }
        if (Addresses) {
            updateFields.Addresses = Addresses;
        }

        const updateuser = await userModel.update(updateFields, { where: { id: userId } });
        
        if (!updateuser) {
            return res.status(400).json({
                error: true,
                statusCode: 400,
                message: 'User not updated successfully'
            })
        }
        else {
            return res.status(200).json({
                error: false,
                statusCode: 200,
                message: 'User updated successfully'
            })
        }
    }
})

exports.deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    

    const singleuser = await userModel.findOne({ where: { id: id } }, { isdeleted: 1 });        
     
    if (!singleuser) {
        return res.status(400).json({
            error: true,
            statusCode: 400,
            message: 'User already deleted'
        })
    }
    else {

        const updateStatus = await userModel.update({ isdeleted: 1 }, { where: { id: id } })

        if (!updateStatus) {

            return res.status(400).json({
                error: true,
                statusCode: 400,
                message: 'not status updated'
            })
        }
        else {

            return res.status(200).json({
                error: false,
                statusCode: 200,
                message: 'successfully deleteUser'
            })
        }

    }
})
