const BookModel = require('../models/bookModel');
const CategoryModel=require('../models/CategoryModel');
const catchAsync=require('../utils/catchAsync');


//create Category by Admin
exports.createCategory=catchAsync(async (req,res)=>{
    const{categoryName}=req.body;
    console.log(req.body,"jjjjjjjj")
     console.log(categoryName,"KLKL") 
    const existedCategory= await CategoryModel.findAll({where:{categoryName:categoryName}})
    console.log(existedCategory,"kllllk")                    
    if(existedCategory.length>0){
        return res.status(400).json({                      
            error:true,
            statusCode:400,
            message:'Category already exists'
        })
    }
    

    const categoryCreated=await CategoryModel.create({categoryName})
    console.log(categoryCreated)
    return res.status(200).json({
        error:false,
        statusCode:200,
        data:categoryCreated
    })
})

//Categorywise all Book show
exports.categoryWiseBook=catchAsync(async(req,res)=>{

    const allCategories= await CategoryModel.findAll({include:[{model:BookModel,as:'book',where:{isdeleted:0}}]});
        console.log(allCategories);
        
    if(!allCategories){
        return res.status(404).json({
            error:true,
            statusCode:404,
            message:'No category found'
        })
    }
    else{
        
        return res.status(200).json({
            error:false,
            statusCode:200,
            message:'getAll Categories successfully ',
            data:allCategories
        })
    }
})

//getAllCategory
exports.getAllCategory=catchAsync(async(req,res)=>{
    const allCategories= await CategoryModel.findAll()
    if(!allCategories.length>0){
        return res.status(400).json({
            error:true,
            statusCode:400,
            message:"No Category found"
        })
    }
    else{
        return  res.status(200).json({
            error:false,
            statusCode:200,
            data:allCategories
        })
    }
})

//getAll SingleCategory
exports.singleCategory=catchAsync(async(req,res)=>{
    const{id}=req.params;

    const singleCategory= await CategoryModel.findOne({where:{id:id}});

    if(!singleCategory){
        return res.status(404).json({
            error:true,
            statusCode:404,
            message:'category not found'
        })
    }
    else{
        return res.status(200).json({
            error:false,
            statusCode:200,
            data:singleCategory
        })
    }
})

//deleteOneCategory by Admin
exports.deleteCategory=catchAsync(async(req,res)=>{
    const{id}=req.params;
    console.log(id)
    const getCategory = await CategoryModel.findOne({where:{id:id}});
   console.log(getCategory);
    if(!getCategory){           
        return res.status(404).json({
            error:true,
            statusCode:404,
            message:'Category Not Found'
        })
    }
    else{

        const deleteCategory= await CategoryModel.destroy({where:{id:id}});
        
        return res.status(200).json({
            error:false,
            message:'Successfully deleted category',
            statusCode:200,
            data:deleteCategory

        })
    }
})

//destroyAllCateogry
exports.destroyAllCategory= catchAsync(async (req,res)=>{
    
       const deleteAllCategory= await CategoryModel.truncate(); 
        console.log(deleteAllCategory)
        if(!deleteAllCategory){
            return res.status(400).json({
                error:true,
                statusCode:400,
                message:'Category deleted successfully'
            })
        }

       
})

//updateAllCategory
exports.updateCategory=catchAsync(async (req,res)=>{
        const{id}=req.params;
        const{categoryName}=req.body;

        const getCategory= await CategoryModel.findOne({where:{id:id}});
            
        if(!getCategory){
            return res.status(404).json({
                error:true,
                statusCode:404,
                message:'Category not found'
            })
        }
        else{
            const updateCategory = await CategoryModel.update(categoryName,{where:{id:id}})
            if(!updateCategory){
                return res.status(400).json({
                    error:true,
                    statusCode:400,
                    message:'Category not updated'
                })
            }
            else{
                return res.status(200).json({
                    error:false,
                    statusCode:200,
                    message:'Category updated successfully'
                })
            }
        }
})

