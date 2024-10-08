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
const path=require('path');
const { throwDeprecation } = require('process');


cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret // Click 'View Credentials' below to copy your API secret
 });

//signup User
exports.signup = catchAsync(async (req, res) => {

    const { name, email, password, mobilenum } = req.body;
    console.log(req.body,"signup")
    // console.log()
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
    console.log(req.body)
    const existUser = await userModel.findOne({ where: { [Op.or]: [{ email: email }, { name: email }] } });
    console.log(existUser)
    if (!existUser) {

        return res.status(404).json({
            error: true,
            statusCode: 404,
            message: 'user not found'
        })
    }
    else {
        const Atoken = jwt.sign({ id: existUser.id }, process.env.access_token, {
            expiresIn: "1d",
        });
        const Rtoken= jwt.sign({id:existUser.id},process.env.access_token,{
            expiresIn: "7d",
        })
        
         
        if (!Atoken) {
            return res.status(400).json({ message: "Access token is not defined" });
        }
        if(!Rtoken){
            return res.status(400).json({message:"refresh token is not defined"})
        }
        await res.cookie('jwt',Rtoken,{
            httpOnly: true,
            sameSite: 'None', secure: true,
            maxAge: 24 * 60 * 60 * 1000
        })
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
            return res.status(200).json({
                error: false,
                statusCode: 200,
                message: 'user logging successfully',
                data: { existUser, Atoken },
            })
        }
    }
})

//getAllUser
exports.getAllUser = catchAsync(async (req, res) => {

     
    const getAllusers = await userModel.findAll({
        attributes: { exclude: ['password'] },
        where: {
          roles: 'user'
        }
      });
      
    console.log(getAllusers)
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
    const singleuser = await userModel.findOne({where:{id:id},attributes:{exclude:['password']}});

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
    
    const userId=req.user;
    console.log(userId,"jkk");
    let data;

    const { name, mobilenum ,jobTitle,birthofDate,country} = req.body
     console.log(req.body,"kllllllll")
     console.log(req?.file,"deep")
 
     
     if(req.file){
         const filePath = path.resolve(__dirname , '../uploads/'+ req?.file?.filename);
         console.log(filePath)
         console.log('filePath is not defined');
              data= await cloudinary.uploader.upload(filePath, {
                folder: 'library', // Optional - specify a folder in Cloudinary
                resource_type: 'auto' // Specify the type of resource (image, video, raw)
              });
              console.log(data)
        }
        
    const existUser= await userModel.findOne({where:{id:userId}});
    console.log(existUser,"existUser") 

    if(!existUser){

        return res.status(404).json({
            error:true,
            statusCode:404,
            message:'User not found for updation'
        })
    }
    else {
        
    //  const decoded= Buffer.from(BannerImage,'utf-8');   
    //  console.log(decoded)

        // const resolve=path.resolve(__dirname, '../uploads/' + Date.now()+ '.png')
        // fs.writeFileSync(resolve,decoded);
        // console.log(resolve,"kl")
        // const data= await  cloudinary.uploader.upload(resolve,{
        //    folder:'pdfs',
        //     resource_type:'auto' 
        // })
        const updateObj = {
            name, 
            mobilenum,
            jobTitle,
            birthofDate,
            country,
            BannerImage:data ? data.secure_url :null
        }
        console.log(updateObj,"klll")
        const updateuser = await userModel.update(updateObj, { where: { id: userId } });
        console.log(updateuser)
        if (!updateuser) {
            return res.status(400).json({
                error: true,
                statusCode: 400,
                message: 'User not updated successfully'
            })
        }
        else {
            console.log(updateuser)
            return res.status(200).json({
                error: false,
                statusCode: 200,
                message: 'User updated successfully',
                data:updateuser
            })
        }

        // console.log(data,"youtube");
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
//verify Otp
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

//refershToken
exports.refresh=catchAsync(async (req,res,next)=>{
    const refreshToken=req.headers.cookies.Rtoken
     if(!req.header.cookies.Rtoken){
          return res.redirect('/login');
        // return res.status(404).json({
        //     error:true,
        //     statusCode:404,
        //     message:'Token required'
        // })
     }
     else{
         
          const existrefeshToken= await jwt.verify(refreshToken,process.env.refresh_token);
           if(!existrefeshToken){
                 
              return res.status(400).json({
                error:true,
                 statusCode:404,
                 message:'Invalid refesh token'
              })

           }
           else{
            const acessToken= await jwt.sign({id:existrefeshToken.id},process.env.refresh_token);
            return res.status(200).json({
              erorr:false,
              statusCode:200,
              message:'Token refernece successfully',
              Atoken:acessToken
            })
           }
     }
})

