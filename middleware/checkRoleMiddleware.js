const userModel=require('./../models/userModel');


exports.checkRole= function(roles){

      return async (req,res,next)=>{
      try{
        
        const user=await userModel.findOne({where:{id:req.user}});
        const roled=user.role.toString()
        console.log(roles)
        console.log(roles.includes(roled));
        if(roles.includes(roled)){
           next();
        }
        else{
   
           return res.status(403).json({
               error:true,
               statusCode:403,
               message:'user are restricted to accessing the resource'
           })
        }
   
       }
      catch(err){
        return res.status(403).json({
            error:true,
            statusCode:403,
            message:err.message
        })
      }
    }
    }
     