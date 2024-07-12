const { query, response } = require('express');
const fs = require('fs');
require('dotenv').config('');
const path = require('path');
const bookModel = require('../models/bookModel');
const userModel = require('../models/userModel');
const BookRequestModel = require('../models/bookReuestModel');
const cloudinary = require('cloudinary').v2
const sequelize = require('sequelize')

const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');
const moment = require('moment');
const upload = require('../utils/multer');
const CategoryModel = require('../models/CategoryModel');
const BookModel = require('../models/bookModel');
const { object } = require('joi');



cloudinary.config({
   cloud_name: process.env.cloud_name,
   api_key: process.env.api_key,
   api_secret: process.env.api_secret // Click 'View Credentials' below to copy your API secret
});


        


//create Book api
exports.createBook = catchAsync(async (req, res) => {
   // let uploadResult
   const { BookName, Category, ISBN, Author, TotalQuantity, Price, Publisher, Availability ,Image} = req.body;


   console.log(Image,"hhh");
   console.log(req.body);
   // console.log(req.body) 
   // console.log(Image,"klllll")
   // const Image =req.file;
   // console.log(Image)             
                   
   // const {Image}=req.file;      

   
         
   // const pdf = req.file.filename;
   // console.log(req.file,"hhhhhhh") 
   // console.log(pdf,"kll;lklkllk")
   //  // check if file field exist

   //  let completeFileName = '';

   //  if (req.file) {
   //      const bookFilePath = path.resolve(__dirname, '../uploads/' + req.file.filename)
   //       console.log(bookFilePath,"akash");
   //      const bookFileName =req.file.filename;
   //      completeFileName = bookFileName

 
   //      const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
   //          resource_type: 'raw',
   //          // filename_override: completeFileName,
   //          folder: 'pdf',
   //          format: 'pdf'
   //      })
                
   //      completeFileName = uploadResultPdf.secure_url;
   //      console.log(completeFileName)
   //    //   await fs.promises.unlink(bookFilePath)
   //  }




   // upload Image for base64
   //   const encodeImage= new Buffer.from().toString('base64')           ;
     const decoded= Buffer.from(Image,"base64");   
     console.log(decoded)

   //   const uploadsDir  = path.resolve(__dirname, '../uploads');
   //    fs.promises.mkdir(uploadsDir, { recursive: true }) // Create uploads dir if it doesn't exist
   //   .catch(err => console.error('Error creating uploads directory:', err)) ;
    
   // const bookFilePath = path.resolve(__dirname, '../uploads/' + req.file.filename)
   const filePath = path.resolve(__dirname, '../uploads/' + Date.now()+ '.png' );

   console.log(filePath,"kathan")
   if (!filePath) {
      return null;
   }

   fs.writeFileSync(filePath, decoded);


             

   // const bookFilePath = path.resolve(__dirname, '../uploads/' + req.file.filename)
   // console.log(bookFilePath)
   
      // console.log(Image,"llllllll")
      const uploadResult = await cloudinary.uploader.upload(filePath , {
   
         folder: 'pdfs', // Optional - specify a folder in lCloudinary
         resource_type: 'auto',
   
   
      })

      console.log(uploadResult)
   
   // const removeFile =  fs.unlink(filePath, (err) => {console.log(err)})
   // console.log(removeFile)

   // //  cloudinary.api.resource('sample_pdf', 
   // //    { pages: true },     
   // //    function(error, result) {
   // //       console.log(result, error); 
   // //    });

   // console.log(uploadResult.secure_url,"klllll")
   // await fs.promises.unlink(filePath)
   //  console.log(result)
   //  upload Image from cloudinary
   // const imagePath =  path.resolve(__dirname, '../uploads/',Image);   

   //  console.log(filePath)

   // Get the URL of the uploaded image
   //  const imageUrl = data.secure_url;




   const existedBook = await bookModel.findOne({ where: { BookName: BookName } });
  
   if (existedBook) {
      return res.status(200).json({
         error: true,
         statusCode: 200,
         message: 'Book already exists'
      })
   }
    const categoryId= await CategoryModel.findOne({where:{categoryName:Category}});
    console.log(categoryId,"yyyyy")
    if(!categoryId){
      return res.status(404).json({
         error:true,
         message:'category not found',
         statusCode:404
      })
    }
    console.log(categoryId.id)

   const book = await bookModel.create({
      BookName,
      Category:categoryId.id,
      Author,
      ISBN,
      TotalQuantity,
      Remaining_Quantity: TotalQuantity,
      Price,
      Image:uploadResult.secure_url
      
   })

   console.log(book, "KLKLKL")

   if (!book) {
      return res.status(400).json({
         error: true,
         statusCode: 400,
         message: 'Somehow book is not Added'
      })
   }
   return res.status(201).json({
      error: false,
      statusCode: 201,
      message: "created book successfully",
      data: book   
   })

})


//Request For Book new User
exports.RequestForBook = catchAsync(async (req, res) => {

   const { BookId ,Day} = req.body;
   const userId = req.user;

   if(!Day){
      return res.status(404).json({
         message:'day are required'
      })
   }

   const user = await userModel.findByPk(userId);
   console.log(user,"io")
   if (!user) {
      return res.status(200).json({
         error: true,
         statusCode: 404,
         message: "User not found"
      })
   }
   const book = await bookModel.findByPk(BookId);
   console.log(book,"noo")
   if (!book) {
      return res.status(404).json({
         error: true,
         statusCode: 404,
         message: "Book not found"
      })
   }

   if (!book.Remaining_Quantity > 0) {
       
      return res.status(200).json({
         error: true,
         statusCode: 404,
         message: "out of stock ",


      })
   }
   else {

      if (book.Remaining_Quantity > 0) {

         const existedRequest = await BookRequestModel.findOne({ where: { [Op.and]: [{ userId: userId }, { bookId: book.id }] } })
         console.log(existedRequest,"missing")
         if (existedRequest) {
            return res.status(400).json({
               error: true,
               statusCode: 400,
               message: ` already Book No.${BookId} requested by user ${userId}`,

            })
         }
         const requestMethod = await BookRequestModel.create({
            userId: userId,
            bookId: book.id,
            isBookApproved: 'pending',
            Day:Day
         });
         console.log(requestMethod, "klklkl")

         if (!requestMethod) {
            return res.status(404).json({
               error: true,
               statusCode: 404,
               message: 'Invalid request'
            })
         }
         else {

            return res.status(200).json({
               error: false,
               statusCode: 200,
               message: 'Request for book successfully',
               data: requestMethod
            })
         }

      }


   }

})

//Single Book
exports.getOne = catchAsync(async (req, res) => {

   const { id } = req.params;

   const singleBook = await bookModel.findOne({ where: { id: id } });

   if (!singleBook) {
      return res.status(404).json({
         error: true,
         statusCode: 404,
         message: "Book not available"
      })
   }

   return res.status(200).json({
      error: false,
      statusCode: 200,
      message: 'book are available',
      data: singleBook

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



exports.getAll = catchAsync(async (req, res) => {

   const getAllbook = await bookModel.findAll({
      include: [{
         model: CategoryModel,
         as: 'category', // Specify the alias here
         attributes: ['CategoryName']
      }]
   });

   if (!getAllbook.length > 0) {
      return res.status(404).json({
         error: true,
         statusCode: 404,
         message: "books are not available",
      })
   }
   return res.status(200).json({
      error: false,
      statusCode: 200,
      message: "All books get Successfully",
      data: getAllbook
   })
})

//updatedBook details
exports.updateBook = catchAsync(async (req, res) => {

   
   const { id } = req.params;
   const { user, TotalQuantity, Price, Availability, Publisher } = req.body;

   const updateObject = {
      user, TotalQuantity, Price, Availability, Publisher
   }

   const updatedBookdetails = await bookModel.update(updateObject, { where: { id: id } });

   if (!updatedBookdetails) {
      return res.status(400).json({
         error: true,
         statusCode: 400,
         message: "book not update succesfully",
         updated: updatedBookdetails
      })
   }
   return res.status(200).json({
      error: false,
      statusCode: 200,
      message: "upadate Book Succesfully",

   })


})

//deleteSingle Book
exports.deleteOne = catchAsync(
   async (req, res) => {

      const { bookId } = req.params;
      console.log(bookId)

      // const { Availability } = req.body;

      const getBook = await bookModel.findOne({ where: { id: bookId } });
      console.log(getBook,"=====>deleteBook")      

      if (!getBook) {
         return res.status(404).json({
            error: true,
            statusCode: 404,
            message: 'Book are already deleted'
         })
      }
      else{

         if(getBook.TotalQuantity!=getBook.Remaining_Quantity){
            
             return res.status(400).json({
               error:true,
               statusCode:400,
               message:'Book assign to someone User'
             })
         }
         // await BookRequestModel.destroy({where:{bookId:bookId}})
         const deleted= await bookModel.update({isdeleted:1},{where:{id:bookId}})
         console.log(deleted)
         return res.status(200).json({
            error:false,
            statusCode:200,
            message:"Book are deleted Successfully",
            data:deleted
         })
      }
   })
   
      // const updatedbook = {
      //    Availability
      // }
   //    console.log(getBook.id);
   //     const issued= await BookRequestModel.findAll({where:{bookId:getBook.id}});
   //     console.log(issued,"youtube")

   //     if(!issued){
   //        const deleted= await bookModel.destroy({where:{id:getBook.id}});
   //        return res.status(200).json({
   //          error:false,
   //          statusCode:200,
   //          message:'Book deleted Successfully',
   //          data:deleted
   //        })
   //     }

   //    // console.log(issued)
   //     if(issued.returnStatus!=1)
   //       {
   //       return res.status(400).json({
   //          error:true,
   //          statusCode:400, 
   //          message:'book assign to issued to user',

   //       })
   //     }
   //     else {
   //          if(issued.isdelete==1){
   //             return res.status(400).json({
   //                error:true,
   //                statusCode:400,
   //                message:'book already deleted'
   //             })
   //          }
   //          else{

   //             const deleteOne = await BookRequestModel.update({isdelete:'1'},{where:{ bookId: getBook.id ,userId:issued.userId}})
         
   //             if(!deleteOne){
   //                return res.status(400).json({
   //                   error:true,
   //                   statusCode:400,
   //                   message:'book not deleted successfully',
   //                })
   //             }
   //             else{
   //                return res.status(200).json({
   //                   error: false,
   //                   statusCode: 200,
   //                   message: 'book all deleted successfully',
   //                   data: deleteOne
   //                })
            
   //             }
               
   //          }
   //     }


//deleteAll Book
exports.deleteAll = catchAsync(
   async (req, res) => {

      const { Availability } = req.body;

      const updateStatus = {
         Availability
      }
      await bookModel.truncate();

      console.log(deleteAll)

      return res.status(200).json({
         error: false,
         statusCode: 200,
         message: 'book all deleted successfully',
         deleteAll: deleteAll
      })

   }
)


//Admin assigned to User Book
exports.AssignedBookToUser = catchAsync(
   async (req, res) => {
      
      const { userId, bookId, isBookApproved,day} = req.body;
      console.log(req.body)
 

      const startDate = moment(Date.now());
      const endDate = startDate.clone().add(day, 'days');


      const requestedModel = await BookRequestModel.findOne({ where: { [Op.and]: [{ userId: userId }, { bookId: bookId }] } })


      console.log(requestedModel, "yoi");

      const book = await bookModel.findByPk(bookId);

      if (book.Remaining_Quantity < 0) {
         await bookModel.update({
            Availability:'NotAvailable'
          })
         return res.status(400).json({
            error: true,
            statusCode: 400,
            message: 'Out of stock'
         })
      }
      if (requestedModel.isBookApproved != 'pending') {
         return res.status(400).json({
            error: true,
            statusCode: 400,
            message: `Book already ${requestedModel.isBookApproved}`
         })
      }


      const quantity = book.Remaining_Quantity - 1;

      console.log(quantity);
      
      if(!quantity>1){
         await bookModel.update({
            Availability:'NotAvailable'
          })
      
      }
      const status = isBookApproved == 2 ? "Approved" : "Rejected";

      
      const updateQuantity = await bookModel.update({ Remaining_Quantity: quantity }, { where: { id: book.id } })

      const updateStatus = await BookRequestModel.update({ isBookApproved: isBookApproved, startDate: startDate, endDate: endDate }, { where: { bookId: requestedModel.bookId } })



      const diffInMilliseconds = endDate.diff(startDate);
      const duration = moment.duration(diffInMilliseconds);
      const returnDay = duration.humanize(true);
      console.log(returnDay)



      if (!updateQuantity) {
         return res.status(400).json({
            error: true,
            statusCode: 400,
            message: 'books not available'
         })
      }
      else {

         return res.status(200).json({
            error: false,
            statusCode: 200,
            message: `Book request ${status}`,
            updateStatus,
            updateQuantity,
            returnDay

         })
      }


   }
)


//return status update in bookrequests
exports.returnBook = catchAsync(async (req, res) => {

   const { bookId, isBookApproved, Remaining_Quantity } = req.body;

   const book = await BookRequestModel.findOne({ where: { [Op.and]: [{ bookId: bookId }, { isBookApproved: isBookApproved }] } ,include:[{model:bookModel,as:'book',attributes:['Image']}]})
   console.log(book.returnStatus, "kllkl")
   const Image=book.book.Image;

   const startDate = moment(Date.now());

   const endDate = moment(book.endDate);        

   const diffInMilliseconds = endDate.diff(startDate);
   console.log(diffInMilliseconds)
   const duration = moment.duration(diffInMilliseconds);
   const returnDay = duration.humanize(true);
   const Day = returnDay.split(' ')[1]

   if (Day < 0) {
      // const returnstatus= await BookRequestModel.update({returnStatus:true,isBookApproved:-1},{where:{bookId:bookId}});
      // const backStatus= await BookModel.update({Remaining_Quantity:Remaining_Quantity+1},{where:{id:bookId}})
      return res.status(200).json({
         error: false,
         statusCode: 200,
         message: `returnDate was expired`,
         Day,
         returnstatus,
         backStatus,
         
      })
   }
   else if (Day >= 1) {
      //  console.log(book.returnStatus,"book")
      // if (book.returnStatus > 0) {
      //    return res.status(200).json({ error: false, statusCode: 200, message: 'book already returned' });
      // }

      const returnstatus = await BookRequestModel.update({ returnStatus: true }, { where: { bookId: bookId } });
      const { Remaining_Quantity } = await bookModel.findOne({ where: { id: bookId } });
      const backStatus = await bookModel.update({ Remaining_Quantity: Remaining_Quantity + 1 }, { where: { id: bookId } });
      return res.status(200).json({
         error: false,
         statusCode: 200,
         message: `Book return left ${returnDay}`,
         backStatus,
         returnstatus,
         Image
      })

   }
})

//getAllBookrequest
exports.getAllBookRequest = catchAsync(async (req, res) => {

   const getAllrequest = await BookRequestModel.findAll();
   if (!getAllrequest.length > 0) {
      return res.status(404).json({
         errro: true,
         statusCode: 404,
         message: "No Book are available"
      })
   }

   return res.status(200).json({
      error: false,
      statusCode: 200,
      message: 'All requested book are available'
   })
})


exports.count = catchAsync(async (req, res) => {

   const totalBook = await bookModel.findAndCountAll({where:{isdeleted:0}});
   // const counts= await bookModel.count({where:{isdeleted:0}});
   const availableBook = await bookModel.findAndCountAll({ where: { Remaining_Quantity: { [Op.gt]: 0 },Availability:'Available'} });
   const returnBook = await BookRequestModel.findAndCountAll({ where: { returnStatus: 1 } ,include:[{model:bookModel,as:'book',attributes:['BookName','Image']},{model:userModel,as:'user',attributes:['name']}]})
   const issuesBookResult = await BookRequestModel.findAndCountAll({
      where: { isBookApproved: 'approved', returnStatus: 0 }, include: [{
         model: bookModel,
         as: 'book', // Specify the alias here
         attributes: ['BookName','Image'] // Include attributes from BookModel
      }],
      //  attributes:[
      //    [sequelize.literal('"book"."BookName"'), 'BookName'],
      //  ],
      raw: true, nest: true
   });
   console.log(totalBook,"klklkl")
   // const issuesBook= await BookRequestModel.findAndCountAll({where:{isBookApproved:'approved',returnStatus:0},include: [{
   //    model: bookModel,
   //    attributes: ["id", "BookName"],
   //  }]})   ;
   console.log(issuesBookResult.rows[0].book.Image);
   // const totalBook2={
   //      count:counts,
   //      rows:totalBook.map(item =>({
   //         id:item.book.id,
   //         BookName:item.book.BookName,
   //         Author:item.book.Author,
   //         Price:item.book.Price,
   //         Image:item.book.Image,
   //         user:item.userId
   //      }))
   // }
   // const totalBook2=totalBook.map(object=>(
   //    {
   //       id:object.id,
   //       BookName:object.book.BookName,
   //       Author:object.book.Author,
   //       Price:object.book.Price,
   //       Image:object.book.Image,
         
   //    }))
   const totalUser = await userModel.findAndCountAll({ where: { roles: 'user' } });
   const returnBookResult={
      count:returnBook.count,
      rows:returnBook.rows.map(item =>({
         id:item.id,
         userId:item.userId,
         bookId:item.bookId,
         Image:item.book.Image,
         startDate:item.startDate,
         endDate:item.endDate,
         bookName:item.book.BookName,
         isBookApproved:item.isBookApproved,
         returnStatus:item.returnBookResult,
         user:item.user.name
      }))
   }
   console.log(returnBookResult)
   const issueBook = {  
   count: issuesBookResult.count,
        rows: issuesBookResult.rows.map(issue => ({
            id: issue.id,
            userId: issue.userId,
            bookId: issue.bookId,
            isBookApproved: issue.isBookApproved,
            startDate: issue.startDate,
            endDate: issue.endDate,
            returnStatus: issue.returnStatus,
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt,
            BookName: issue.book.BookName ,
            Image:issue.book.Image// Move BookName to top level
        }))
    };
   console.log(issueBook,"lllllll")
   // const books = issuesBook.rows.map(issue => ({
   //    id: issue.id, // Assuming issue.id is from BookRequestModel
   //    bookName: issue.Book ? issue.Book.BookName : null // Accessing BookName through the alias
   // }));
   // console.log(books)
   if (!totalBook || !availableBook || !returnBookResult || !issuesBookResult || !totalUser) {

      return res.status(404).json({
         error: true,
         statusCode: 404,
         message: 'count not available'
      })
   }
   // console.log(totalBook2,"kathan---")
   return res.status(200).json({
      error: false,
      statusCode: 200,
      message: 'count get Successfully',
      totalBook: totalBook,
      availableBook: availableBook,
      returnBook: returnBookResult,
      issuesBook: issueBook,
      totalUser: totalUser
   })

});

exports.search=catchAsync(async (req,res)=>{

      const {Category}=req.params;

      const searchBook= await bookModel.findAll({where:{Category:Category},include:[{model:CategoryModel,as:'category',attributes:['categoryName']}]})
   
      if(!searchBook.length>0){
         return res.status(400).json({
            error:true,
            statusCode:400
         })
      }
      else{
         const categoryWiseBook= searchBook.map(category=>({
            id:category.id,
            BookName:category.BookName,
            Category:category.Category,
            ISBN:category.ISBN,
            Author:category.Author,
            TotalQuantity:category.TotalQuantity,
            Remaining_Quantity:category.Remaining_Quantity,
            Price:category.Price,
            Image:category.Image,
            Publisher:category.Publisher,
            CategoryName:category.category.categoryName
         })

         )
          return res.status(200).json({
            error:false,
            statusCode:200,
            data:categoryWiseBook  
          })
      }
});

exports.searchBookByName=catchAsync(async(req,res)=>{
    const {BookName}=req.params;

    const searchBook= await bookModel.findOne({where:{BookName:BookName}})

    if(!searchBook){
       return res.status(400).json({
         error:true,
         statusCode:400,
         message:'Book is not found'
       })
    }
    else{
       return res.status(200).json({
         error:false,
         statusCode:200,
         message:'Book are get successfully',
         data:searchBook
       })
    }
     
})

exports.showRequested=catchAsync(async(req,res)=>{
    const requestdBook= await BookRequestModel.findAll({where:{isBookApproved:'pending'},include:[{model:BookModel, as:'book',attributes:['Image','BookName']},{model:userModel,as:'user',attributes:['name']}]});
    console.log(requestdBook)
    if(!requestdBook){
      return res.status(400).json({
         error:true,
         statusCode:400,
         message:'Books are not requested',
      
      })
    }
    else{
        const show= requestdBook.map(object=>({
         user:object.user.name,
         image:object.book.Image,
         bookname:object.book.BookName,
         isBookApproved:object.isBookApproved,
         returnStatus:object.returnStatus,
         userId:object.userId,
         bookId:object.bookId,
         day:object.Day

        }))
       return res.status(200).json({
         error:false,
         statusCode:200,
         message:'requested  book  successfully',
         data:show
       })
    }
})



