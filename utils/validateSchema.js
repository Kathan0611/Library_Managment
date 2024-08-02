const Joi=require('joi');


const registerSchema= Joi.object({
    name:Joi.string().trim().required(),
    email:Joi.string().email().trim().required(),
    password:Joi.string().trim().required(),
    mobilenum: Joi.number().min(10).required()
     
});

const loginSchema= Joi.object({
    email: Joi.alternatives().try(
        Joi.string().email().trim().required(),
        Joi.string().trim().required()
      ),
     password:Joi.string().trim().required()
})

const resetPassword = Joi.object({
    newPassword:Joi.string().trim().required(),
    otp:Joi.string().trim().required()
  });

const newpassword= Joi.object({
    password:Joi.string().trim().required().trim()
})

const forgotpassword =Joi.object({

    email:Joi.string().trim().required().trim()
})

const verifyOtp= Joi.object({
    otp:Joi.string().length(6).trim().required()
}) 

const categoryName=Joi.object({
    categoryName:Joi.string().trim().required()
})
const bookName=Joi.object({
    BookName:Joi.string().trim().required()
})
const AddBookSchema=Joi.object({
    BookName:Joi.string().trim().required(),
    Author:Joi.string().trim().required(),
    Description:Joi.string().required(),
    Category:Joi.string().required(),
    Image:Joi.string().trim().required(),
    ISBN:Joi.string().trim().required(),
    TotalQuantity:Joi.number().required(),
    Price:Joi.number().required(),
    // Publisher:Joi.string().trim().required()
 
})

// const 
module.exports={
    registerSchema,
    loginSchema,
    resetPassword,
    newpassword,
    forgotpassword,
    verifyOtp,
    categoryName,
    AddBookSchema,
    bookName
}
