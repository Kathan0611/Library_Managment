const userModel = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const { randomInt } = require("crypto");
const {sendOtpMail}=require('./../utils/nodemailer')
const moment = require('moment-timezone');
const fs=require('fs');
const cloudinary = require('cloudinary').v2 



//signup User
exports.signup = catchAsync(async (req, res) => {

    const { name, email, password, mobilenum } = req.body;
    console.log(moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'))
    const existedUser = await userModel.findOne({ where: { email: email } })
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
            password: bcrypt.hashSync(password, 10),
            mobilenum,
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
});

//login user  Or Admin
exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const existUser = await userModel.findOne({ where: { [Op.or]: [{ email: email }, { name: email }] } });

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

        const validatePassword = await bcrypt.compare(password, existUser.password);
        if (!validatePassword) {
            return res.status(401).json({
                error: true,
                statusCode: 401,
                message: 'Unauthorized User',
                
                
            })
        }
        const updateLoginStatus = await userModel.update({
            isLogin: true // Set isLogin to true for clarity
        }, {
            where: { id: existUser.id }
        })

        if (!updateLoginStatus) {
            return res.status(400).json({
                error: true,
                statusCode: 400,
                message: 'User is not logged in'
            })
        }
        else {
            existUser.isLogin = updateLoginStatus[0];
            // existUser.token = token   
            return res.status(200).json({
                error: false,
                statusCode: 200,
                message: 'user logging successfully',
                data: { existUser, token },
            })
        }
    }
})

//getAllUser
exports.getAllUser = catchAsync(async (req, res) => {

     
    const getAllusers = await userModel.findAll({where:{roles:'user'}});

    if (!getAllusers.length > 0) {
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

//singleUser
exports.singleUser = catchAsync(async (req, res) => {

    const {id} = req.params;
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

//updateUser
exports.updateUser = catchAsync(async (req, res) => {
    
    const {id} = req.params;
    console.log(id) 
    const { name, mobilenum } = req.body
     console.log(req.body,"kllllllll")
     
    // if(BannerImage){
    //     const decoded= Buffer.from(BannerImage,"base64");   
    //     console.log(decoded)   
    //     const filePath = path.resolve(__dirname , '../uploads', Date.now() + '.png');
    //     fs.writeFileSync(filePath,decoded);
    //     const data= await cloudinary.uploader.upload(filePath, {
    //         folder: 'library', // Optional - specify a folder in Cloudinary
    //         resource_type: 'image' // Specify the type of resource (image, video, raw)
    //       });
         
    //       console.log(data)
    // }
  
    const existUser= await userModel.findOne({where:{id:id}});
    console.log(existUser) 

    if(!existUser){

        return res.status(404).json({
            error:true,
            statusCode:404,
            message:'User not found for updation'
        })
    }
    else {
            
       
        
      
        const updateObj = {
            name, 
            mobilenum
        }

        const updateuser = await userModel.update(updateObj, { where: { id: id } });

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
                message: 'User updated successfully',
                data:updateuser
            })
        }
    }
})

//delete  for user
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


//forgotPassword api for user
exports.forgotPassword=catchAsync(async (req,res)=>{
     const {email}=req.body;


     const findEmailSender= await  userModel.findOne({where:{email:email}});
      
     if(!findEmailSender){
        return res.status(404).json({
            error:true,
            statusCode:404,
            message:'User not found'
        })
     }
     else{
        const otp = randomInt(100000, 1000000);

        const otpExpiration = Date.now() + 60000
        console.log(otpExpiration)
        const updated = await userModel.update(
            {
                otp: otp,
                otpExpiration: otpExpiration
            },          
           {  where: { email: email }},
            
          );
          console.log(updated);

         await sendOtpMail(email,otp)
         return res.status(200).json({
            error:false,
            statusCode:200,
            message:'Successfully Sent OTP',
            otp:otp
        
         })

        
     }
    

})

//resetPassword  of User api
exports.resetPassword = catchAsync(async (req, res) => {
    
     const { newPassword,otp } = req.body;
    console.log(req.body)
    //    console.log(otp,"klkl")    
    //    console.log("kjkklkjlk")
    const user=await  userModel.findOne({where:{otp:otp}});
     
    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hashSync(newPassword, salt);
 
    const updateOtp={
        otp:null,
        otpExpiration:null,
        password:hashedPassword
    }

    const userupadte= await userModel.update(updateOtp,{where:{email:user.email}})
      return res.status(200).json({
        error: false,
        statusCode: 200,
        data: "Password reset successful",
        userupadte
      })
  })

//logout user or admin
exports.logout = catchAsync(async (req, res) => {
  
      const existUser = await User.findOne({
        where: { id: req.user },
        raw: true,
        nest: true,
      });
      const updateLoginStatus = await User.update({
        isLogin: 0,
        where: { id: existUser.id },
      });
  
      if (updateLoginStatus) {
        return res.status(200).json({
          error: false,
          statusCode: 200,
          message: "User logout successfully",
          data: updateLoginStatus,
        });
      }
  });

//changePassword user API
exports.changePassword= catchAsync(async (req,res,next)=>{
       const {email,password}=req.body;
       let {newPassword}=req.body;

       const exitsedUser= await userModel.findOne({where:{email:email}}) ;

       if(!exitsedUser){
          return res.status(404).json({
            errror:true,
            statusCode:404,
            message:"User not found"
          })
       }
       else{

           if(!newPassword){
              return res.status(404).json({
                error:true,
                statusCode:404,
                message:'New password is required'
              })
           }
           const validPassword= await bcrypt.compareSync(exitsedUser.password,newPassword);

           if(validPassword){
               return res.status(404).json({
                error:true,
                statusCode:404,
                message:'Passwords already used'
               })
           }
           else{
              
                const salt = await bcrypt.genSaltSync(10);
                const hashPassword= await bcrypt.hashSync(newPassword,salt);

                const  updatedUser= await userModel.update(hashPassword,{where:{email:email}});

                if(!updatedUser){
                    return res.status(400).json({
                        error:true,
                        statusCode:400,
                        message:'Password not updated'
                    })
                }
                else{

                    return res.status(200).json({
                        error:false,
                        statusCode:200,
                        message:'Password update successful'
                    })
                }


               
           }
       }

})
exports.verify= catchAsync(async (req,res,next)=>{
         const{otp}=req.body;
        console.log(otp,"jkjh");

    
        const user = await userModel.findOne({where:{ otp: otp }});
         

        if (!user || user.otpExpiration < Date.now()) {
          return res.status(400).json({
            error:true,
            statusCode:400,
            message:'Invalid OTP'
          });
        }
       
       
          return res.status(200).json({
            error: true,
            statusCode: 200,
            message: "OTP verify successfully"
})
})