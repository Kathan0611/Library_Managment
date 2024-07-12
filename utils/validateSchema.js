const Joi=require('joi');


const registerSchema= Joi.object({
    name:Joi.string().trim().required(),
    email:Joi.string().email().trim().required(),
    password:Joi.string().trim().required(),
    mobilenum: Joi.number().required()
     
});

const loginSchema= Joi.object({
    email: Joi.alternatives().try(
        Joi.string().email().trim().required(),
        Joi.string().trim().required()
      ),
     password:Joi.string().trim().required()
})

const resetPassword = Joi.object({
    newPassword:Joi.string().trim().required()
  });

const newpassword= Joi.object({
    password:Joi.string().trim().required().trim()
})

const forgotpassword =Joi.object({

    email:Joi.string().trim().required().trim()
})

const verifyOtp= Joi.object({
    otp:Joi.string().regex(/^[0-9]{6}$/).message('digits must be 6 length').trim().required()
})

const categoryName=Joi.object({
    categoryName:Joi.string().trim().length(3).required()
})

module.exports={
    registerSchema,
    loginSchema,
    resetPassword,
    newpassword,
    forgotpassword,
    verifyOtp,
    categoryName
}
