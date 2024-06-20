const Joi=require('joi');


const registerSchema= Joi.object({
    name:Joi.string().trim().required(),
    email:Joi.string().email().trim().required(),
    password:Joi.string().trim().required(),
    roles:Joi.number().required(),
    birthDate:Joi.date(),
    Address:Joi.string().allow("").required()
     
});

const loginSchema= Joi.object({
    email: Joi.alternatives().try(
        Joi.string().email().trim().required(),
        Joi.string().trim().required()
      ),
     password:Joi.string().trim().required()
})

const resetPassword = Joi.object({
    email: Joi.string().trim().email().required().label("Email").trim(),
  });

const newpassword= Joi.object({
    password:Joi.string().trim().required().trim()
})

const forgotpassword =Joi.object({

    email:Joi.string().trim().required().trim()
})



module.exports={
    registerSchema,
    loginSchema,
    resetPassword,
    newpassword,
    forgotpassword
}
