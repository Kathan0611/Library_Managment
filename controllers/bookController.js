const { query, response } = require('express');
const fs=require('fs');
const path=require('path');
const bookModel=require('../models/bookModel');
const userModel = require('../models/userModel');
const BookRequestModel=require('../models/bookReuestModel');
const cloudinary = require('cloudinary').v2


const catchAsync=require('../utils/catchAsync');
const {Op}=require('sequelize');
const BookModel = require('../models/bookModel');
const moment=require('moment');
const upload = require('../utils/multer');



cloudinary.config({ 
   cloud_name: 'dzjsh0yaj', 
   api_key: '268313789642539', 
   api_secret: '7k4EXg2o1ORMESgD3-XW8lg7arw' // Click 'View Credentials' below to copy your API secret
});


 
   

//create Book api
exports.createBook =catchAsync(async (req,res)=>{
   // let uploadResult
   const {BookName,Category,ISBN,Author,TotalQuantity,Price,Publisher,Availability}=req.body;
   // console.log(req.body) 
    
      const {Image}=req.file;
      //upload Image for base64
   //   const encodeImage= new Buffer.from('C:\Users\THINKTANKER\Downloads\kathan.png').toString('base64')           ;
     const decoded= Buffer.from(Image,"base64");   
   //   console.log(decoded)     
 
   //   const uploadsDir  = path.resolve(__dirname, '../uploads');
   //    fs.promises.mkdir(uploadsDir, { recursive: true }) // Create uploads dir if it doesn't exist
   //   .catch(err => console.error('Error creating uploads directory:', err)) ;
     

       const filePath = path.resolve(__dirname , '../uploads', Date.now() + '.png');

            if(!filePath){
               return null;
            }
          fs.writeFileSync(filePath,decoded); 
   
        const data= await cloudinary.uploader.upload(filePath, {
            folder: 'library', // Optional - specify a folder in Cloudinary
            resource_type: 'auto' // Specify the type of resource (image, video, raw)
          });
         //  cloudinary.api.resource('sample_pdf', 
         //    { pages: true },     
         //    function(error, result) {
         //       console.log(result, error); 
         //    });

         //  console.log(data)
          console.log(result)
   //  upload Image from cloudinary
   // const imagePath =  path.resolve(__dirname, '../uploads/',Image);   

   //  console.log(filePath)

    // Get the URL of the uploaded image
    const imageUrl = data.secure_url;
       

   
     
    const existedBook= await bookModel.findOne({where:{BookName:BookName}});

    if(existedBook){
       return res.status(200).json({    
         error:true,
         statusCode:200,
         message:'Book already exists'
       })
    }                              
                        
     const book= await bookModel.create({
        BookName,
        Category,
        Author,
        ISBN,
        TotalQuantity,
        Remaining_Quantity:TotalQuantity,
        Price,    
        Image:imageUrl
     })
     
      console.log(book,"KLKLKL")

      if(!book){
         return res.status(400).json({
            error:true,
            statusCode:400,
            message:'Somehow book is not Added'
         })
      }
     return res.status(201).json({
        error:false,
        statusCode:201,
        message:"created book successfully",
        data:book
     })
     
})


//Request For Book new User
exports.RequestForBook= catchAsync(async (req,res)=>{

     const{BookId}=req.params;
     const userId=req.user;
     
     const user= await userModel.findByPk(userId);
     if(!user){
        return res.status(200).json({
          error:true,
          statusCode:404,
          message:"User not found"
        })
     }
     const book= await bookModel.findByPk(BookId);
    
     if(!book){
         return res.status(404).json({
            error:true,
            statusCode:404,
            message:"Book not found"
         })
     }
         
        if(!book.Remaining_Quantity>0){
            return res.status(200).json({
               error:true,
               statusCode:404,
               message:"out of stock "

            })
        }
        else{
   
             if(book.Remaining_Quantity>0){
                
               const existedRequest = await BookRequestModel.findOne({where:{[Op.and]:[{ userId: userId }, { bookId:book.id }]}})

               if(existedRequest){
                  return res.status(400).json({
                     error:true,
                     statusCode:400,
                     message:` already Book No.${BookId} requested by user ${userId}`,
   
                  })
               }
                 const requestMethod= await BookRequestModel.create({
                  userId:userId,
                  bookId:book.id,
                  isBookApproved:'pending'
                 });
                 console.log(requestMethod,"klklkl")
            
             if(!requestMethod){
                 return res.status(404).json({
                  error:true,
                 statusCode:404,
                 message:'Invalid request'
                 })
             }
             else{
              
               return res.status(200).json({
                  error:false,
                  statusCode:200,
                  message:'Request for book successfully',
                  data:requestMethod
               })
             }

        }
            
          
     }

})

//Single Book
exports.getOne=catchAsync(async (req,res)=>{

    const {id}=req.params;

    const singleBook= await bookModel.findOne({where:{id:id}});

    if(!singleBook){
      return res.status(404).json({
         error:true,
         statusCode:404,
         message:"Book not available"
      })
    }

     return res.status(200).json({
         error:false,
         statusCode:200,
         message:'book are available',
         data:singleBook

     })
})

//getAllBooks


// exports.getAll = async (req, res) => {
//    try {
//       console.log("Hello");  // Fixed console log message
//       // Here you can add code to fetch data or perform other operations asynchronously
//       // Example:
//       // const data = await fetchData();  // Replace fetchData() with your actual async operation
//       // res.status(200).json(data);      // Example response sending data back
//    } catch (err) {
//       console.error(err);  // Changed console.log to console.error for errors
//       res.status(500).send("Server Error");  // Example of sending a server error response
//    }
// };



exports.getAll =catchAsync(async (req,res)=>{

   const getAllbook= await bookModel.findAll({});

   if(!getAllbook.length>0){
      return res.status(404).json({
         error:true,
         statusCode:404,
         message:"books are not available",
      })
   }
   return res.status(200).json({
      error:false,
      statusCode:200,
      message:"All books get Successfully",
      data:getAllbook
   })
})

//updatedBook details
exports.updateBook=catchAsync(async(req,res)=>{


      const {id}=req.params;
      const {user,TotalQuantity,Price,Availability,Publisher}=req.body;

      const updateObject={
         user,TotalQuantity,Price,Availability,Publisher
      }

      const updatedBookdetails=await bookModel.update(updateObject,{where:{id:id}});
      
      if(!updatedBookdetails){
         return res.status(400).json({
            error:true,
            statusCode:400,
            message:"book not update succesfully",
            updated:updatedBookdetails
         })
      }
      return res.status(200).json({
         error:false,
         statusCode:200,
         message:"upadate Book Succesfully",
         
      })
      

})
         
//deleteSingle Book
exports.deleteOne=catchAsync(
   async (req,res)=>{

      const {id}=req.params;
      const{Availability}=req.body;

      const getBook= await bookModel.findOne({where:{id:id}});
      console.log(getBook)
 
      if(!getBook){
         return res.status(404).json({
             error:true,
             statusCode:404,
             message:'Book are already deleted'
         })
     }
     
    const updatedbook= {
      Availability
    }
     const deleteOne= await bookModel.update(updatedbook,{where:{id:id}})

     return res.status(200).json({
      error:false,
      statusCode:200,
      message:'book all deleted successfully',
      data:deleteOne
  })

   }
)
  
//deleteAll Book
exports.deleteAll=catchAsync(
   async (req,res)=>{

    const{Availability}=req.body;
    
     const updateStatus={
      Availability
     }
     await bookModel.truncate();
   
     console.log(deleteAll)

     return res.status(200).json({
      error:false,
      statusCode:200,
      message:'book all deleted successfully',
      deleteAll:deleteAll
  })

   }
)
 

//Admin assigned to User Book
exports.AssignedBookToUser=catchAsync(
   async(req,res)=>{

      const{userId,bookId,isBookApproved}=req.body;
      console.log(req.body)


      const startDate = moment(Date.now());
      const endDate    = startDate.clone().add(15,'days');
      
   
      const  requestedModel= await BookRequestModel.findOne({ where: { [Op.and]: [{ userId:userId  }, { bookId: bookId }] } })
      
        
      console.log(requestedModel,"yoi");
     
      const book= await BookModel.findByPk(bookId);

      if(book.Remaining_Quantity<0){
         return res.status(400).json({
            error:true, 
            statusCode:400  ,   
            message:'Out of stock'
         })
      }
      if(requestedModel.isBookApproved !='pending'){
          return res.status(400).json({
            error:true,   
            statusCode:400,
            message:`Book already ${requestedModel.isBookApproved}`
          })
      }
       
      
      const quantity= book.Remaining_Quantity-1;
 
      console.log(quantity);
     
      const status = isBookApproved == 2 ? "Approved" : "Rejected";
     
      const updateQuantity= await bookModel.update({Remaining_Quantity:quantity},{where:{id:book.id}})

      const updateStatus= await BookRequestModel.update({isBookApproved: isBookApproved,startDate:startDate,endDate:endDate},{where:{bookId:requestedModel.bookId}})

      

      const diffInMilliseconds = endDate.diff(startDate);             
      const duration = moment.duration(diffInMilliseconds);
      const returnDay = duration.humanize(true); 
      console.log(returnDay)   
 
   

      if(!updateQuantity){
         return res.status(400).json({
            error:true,
            statusCode:400,
            message:'books not available'
         })
      }
      else{   
           
          return res.status(200).json({
            error:false,
            statusCode:200,
            message:`Book request ${status}`,
            updateStatus,
            updateQuantity,
            returnDay

          })
      }
      
      
   }
) 


//return status update in bookrequests
exports.returnBook=catchAsync(async(req,res)=>{

     const {bookId,isBookApproved,Remaining_Quantity}=req.body;

     const book= await BookRequestModel.findOne({where:{[Op.and]:[{bookId:bookId},{isBookApproved:isBookApproved}]}})
     console.log(book.returnStatus,"kllkl")
     const startDate=moment(Date.now());

     const endDate=moment(book.endDate);

     const diffInMilliseconds =endDate.diff(startDate);   
     console.log(diffInMilliseconds)          
     const duration = moment.duration(diffInMilliseconds);         
     const returnDay = duration.humanize(true); 
     const Day=returnDay.split(' ')[1]
     
     if(Day<0){
      // const returnstatus= await BookRequestModel.update({returnStatus:true,isBookApproved:-1},{where:{bookId:bookId}});
      // const backStatus= await BookModel.update({Remaining_Quantity:Remaining_Quantity+1},{where:{id:bookId}})
      return res.status(200).json({
        error:false, 
        statusCode:200,     
        message:`returnDate was expired`,
        Day,
        returnstatus,
        backStatus
      })
     }
     else if(Day>=1){
         //  console.log(book.returnStatus,"book")
      if(book.returnStatus >0){
         return res.status(200).json({error:false, statusCode:200 ,message:'book already returned'});
      }
       
      const returnstatus= await BookRequestModel.update({returnStatus:true},{where:{bookId:bookId}});
      const {Remaining_Quantity}= await BookModel.findOne({where:{id:bookId}});
      const backStatus= await BookModel.update({Remaining_Quantity:Remaining_Quantity+1},{where:{id:bookId}});
         return res.status(200).json({
            error:false,
            statusCode:200,
            message:`Book return left ${returnDay}`,
            backStatus,
            returnstatus
         })

     }
})

//getAllBookrequest
exports.getAllBookRequest=catchAsync(async (req,res)=>{
  
    const getAllrequest= await  BookRequestModel.findAll();
    if(!getAllrequest.length>0){
       return res.status(404).json({
         errro:true,
         statusCode:404,
         message:"No Book are available"
       })
    }

    return res.status(200).json({
       error:false,
       statusCode:200,
       message:'All requested book are available'
    })
})


exports.count= catchAsync(async(req,res)=>{
     
    const totalBook= await BookModel.findAndCountAll();
    const availableBook= await BookModel.findAndCountAll({where:{Remaining_Quantity: {[Op.gt]: 0}}});
    const returnBook= await BookRequestModel.findAndCountAll({where:{returnStatus:1}})
    const issuesBook= await BookRequestModel.findAndCountAll({where:{isBookApproved:'approved'}});
    const totalUser= await userModel.findAndCountAll({where:{roles:'user'}});  
     
   
    if(!totalBook || !availableBook || !returnBook || !issuesBook || !totalUser){

          return res.status(404).json({
          error:true,
          statusCode:404,
          message:'count not available'
       })
    }
                   
    return res.status(200).json({
      error:false,
      statusCode:200,
      message:'count get Successfully',
      totalBook:totalBook,      
      availableBook:availableBook,
      returnBook:returnBook,
      issuesBook:issuesBook,
      totalUser:totalUser          
    })

});





