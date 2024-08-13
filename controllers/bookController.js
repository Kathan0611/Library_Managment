const { query, response } = require('express');
const fs = require('fs');
require('dotenv').config('');
const path = require('path');
const bookModel = require('../models/bookModel');
const userModel = require('../models/userModel');
const BookRequestModel = require('../models/bookReuestModel');
const cloudinary = require('cloudinary').v2
const Sequelize = require('sequelize')
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');
const moment = require('moment');
const upload = require('../utils/multer');
const CategoryModel = require('../models/CategoryModel');
const BookModel = require('../models/bookModel');
// const{io}=require('./../server');
// console.log(io)
// socket.on('connection', () => {
//    console.log('A user connected');
// });



// socket.listen(5000);


cloudinary.config({
   cloud_name: process.env.cloud_name,
   api_key: process.env.api_key,
   api_secret: process.env.api_secret // Click 'View Credentials' below to copy your API secret
});


        


//create Book api
exports.createBook = catchAsync(async (req, res) => {
   
   const { BookName, Category, ISBN, Author, TotalQuantity, Price, Description} = req.body;

   let ImagefilePath
   let bookfilePath;
   let uploadResult;
   let uploadBook;
   const { Image, BookPdf } = req.files;
   console.log(req.files)
   const imagePath = Image ? Image[0].filename : null;
   const bookPdfPath = BookPdf ? BookPdf[0].filename : null;
   // console.log(Image,"klkl");

   // console.log(BookPdf,"hhh");
   // console.log(req.body);
  



  
   //   const decoded= Buffer.from(Image,"base64");   
   //   console.log(decoded)

   if(imagePath){
       ImagefilePath = path.resolve(__dirname, '../uploads/' + imagePath);
       const uploadResult = await cloudinary.uploader.upload(ImagefilePath , {
          folder: 'Book', 
          resource_type: 'auto',
       })
      //  console.log(uploadResult)

   }
   if(bookPdfPath){
      bookfilePath=path.resolve(__dirname,'../uploads/'+ bookPdfPath);
      uploadBook= await cloudinary.uploader.upload(bookfilePath,{
         folder:"Bookpdfs",
          resource_type:"auto"
      })
   }
   // console.log(filePath,"kathan")
   //   if(!ImagefilePath) {
   //       return null;
   //    }
   //    if(!bookPdfPath){
   //       return null
   //    }
   // // fs.writeFileSync(filePath, decoded);
   
      console.log(uploadBook)
   



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
   //  console.log(categoryId.id)

   const book = await bookModel.create({
      BookName,
      Category:categoryId.id,
      Author,
      ISBN,
      TotalQuantity,
      Remaining_Quantity: TotalQuantity,
      Price,
      Image:uploadResult? uploadResult.secure_url:null,
      BookPdf:uploadBook? uploadBook.secure_url:null,
      Availability:"Available",
      Description           
   })

   console.log(book, "KLKLKL")

   if (!book) {
      return res.status(400).json({
         error: true,
         statusCode: 400,
         message: 'Somehow book is not Added'
      })
   }
//    socket.emit('bookCreated', {
//       message: 'A new book has been created!',
//       data: book
//   });
//   socket.on('bookCreated', (data) => {
//       console.log('New Book Created:', data.message);
//       // Handle the new book data as needed
//   });
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
   console.log(req.body,"LLLLL")
   const userId = req.user;
   // console.log(userId)
   if(!Day){
      return res.status(404).json({
         message:'day are required'
      })
   }

   const user = await userModel.findByPk(userId);
   console.log(user,"io")
   if (!user) {
      return res.status(404).json({
         error: true,
         statusCode: 404,
         message: "User not found"
      })
   }
   // console.log(BookId)
   const book = await bookModel.findOne({where:{id:BookId}});
   console.log(book,"noo")
   if (!book) {
      return res.status(404).json({
         error: true,
         statusCode: 404,
         message: "Book not found"
      })
   }

   if (!book.Remaining_Quantity > 0) {
       
      return res.status(404).json({
         error: true,
         statusCode: 404,
         message: "out of stock ",


      })
   }
   else {
         const existedRequest = await BookRequestModel.findOne({ where: { [Op.and]: [{ userId: userId }, { bookId: book.id },{isBookApproved:"pending"}] } })
           if(!existedRequest)
            {      
            const approvedRequest= await  BookRequestModel.findOne({where:{ [Op.and]: [{ userId: userId }, { bookId: book.id },{isBookApproved:"approved"},{returnStatus:0},{isdelete:0}] }});
            console.log(approvedRequest,"200")
             if(approvedRequest){
                return res.status(200).json({
                  error:true,
                  statusCode:400,
                  message:`book already ${approvedRequest.isBookApproved}`
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
            else{    
               return res.status(200).json({
                  error: false,
                  statusCode: 200,
                  message: 'Request for book successfully',
                  data: requestMethod
               })                     
            }
           }
         else{
            return res.status(400).json({
               error:true,
               statusCode:400,
               message:`again book requested by user ${user.name}`
            })   
         }
      
      
   }
})

//Single Book
exports.getOne = catchAsync(async (req, res) => {

   const { id } = req.params;
   //  console.log(id);
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



//getAll books wise Category
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
      
      const { userId,bookId,isBookApproved,day} = req.body;
      console.log(req.body)

      if(!userId || !bookId ||!isBookApproved ||!day){
         return res.status(422).json({
            error:true,
            statusCode:422,
            message:"Invalid book assign"

         })
      }
      const startDate = moment(Date.now());
      const endDate = startDate.clone().add(day, 'days');


      const requestedModel = await BookRequestModel.findOne({ where: { [Op.and]: [{ userId: userId }, { bookId: bookId },{isBookApproved:1}] } })

   
      console.log(requestedModel.isBookApproved, "yoi");

      const book = await bookModel.findByPk(bookId);
       let quantity=book.Remaining_Quantity;
      //  console.log(book.Remaining_Quantity,"youtube")
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
      //  console.log(requestedModel,"klkl")
      const status = isBookApproved == 2 ? 'approved' : 'rejected';
      console.log(requestedModel.isBookApproved,"status")
      if (requestedModel.isBookApproved != 'pending') {
         return res.status(400).json({
            error: true,
            statusCode: 400,
            message: `Book already ${requestedModel.isBookApproved}`
         })
      }
      //  console.log()
      if(status!='rejected'){
         quantity = quantity - 1;
         console.log(quantity);
      }
      
      if(!quantity>1){
         await bookModel.update({
            Availability:'NotAvailable'
          })
      
      }
      // const status = isBookApproved == 2 ? "approved" : "rejected";

      
      const updateQuantity = await bookModel.update({ Remaining_Quantity: quantity }, { where: { id: book.id } })

      const updateStatus = await BookRequestModel.update({ isBookApproved: status, startDate: startDate, endDate: endDate }, { where: { id: requestedModel.id } })



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

   const { bookId, isBookApproved } = req.body;
    
   const book = await BookRequestModel.findOne({ where: { [Op.and]: [{ bookId: bookId }, { isBookApproved: isBookApproved }] } ,include:[{model:bookModel,as:'book',attributes:['Image']},{model:userModel,as:'user',attributes:['name']}]})
   const Image=book.book.Image;

   const startDate = moment(Date.now());
   console.log(startDate,"ddd")
   const endDate = moment(book.endDate);            
     console.log(endDate,"ddd")
   const diffInMilliseconds = endDate.diff(startDate);
   // console.log(diffInMilliseconds)
   const duration = moment.duration(diffInMilliseconds);
   console.log(duration,"Hello")
   const returnDay = duration.humanize(true);
   console.log(returnDay,"llllll")
   const Day = returnDay.split(' ')[1]
     console.log(Day,"yiou")
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

//count of all book
exports.count = catchAsync(async (req, res) => {

   const userId=req.user;
   // console.log(userId,"admin hoy to");
   let issuesBookResult;
   const userRole= await userModel.findOne({where:{id:userId}});
   // console.log(userRole.roles,"-----results")
   const totalBook = await bookModel.findAndCountAll({where:{isdeleted:0,Category:{ [Op.not]: null}},include:[{model:CategoryModel,as:'category',attributes:['categoryName','id']}]});
   const availableBook = await bookModel.findAndCountAll({ where: { isdeleted:0,Remaining_Quantity: { [Op.gt]: 0 },Availability:'Available',Category:{ [Op.not]: null},} });
   const returnBook = await BookRequestModel.findAndCountAll({ where: { returnStatus: 1 } ,include:[{model:bookModel,as:'book',attributes:['BookName','Image']},{model:userModel,as:'user',attributes:['name']}]})
   console.log(returnBook,"meri behna")


   if(userRole.roles==='user'){
      console.log(userRole,"hanumaji")
       issuesBookResult = await BookRequestModel.findAndCountAll({
         where: {  [Sequelize.Op.or]: [
            { isBookApproved: 'approved' }
          ], returnStatus: 0,userId:userId,isdelete:0}, include: [{
            model: bookModel,
            as: 'book', // Specify the alias here
            attributes: ['BookName','Image','BookPdf'] // Include attributes from BookModel
         },{        
            model: userModel,
            as:'user',
            attributes:['name']
         }],
         raw: true, nest: true
      });
      console.log("wednesday")
  
   }
   else{
      console.log("admin-bhai")
          issuesBookResult = await BookRequestModel.findAndCountAll({
         where: {  [Sequelize.Op.or]: [
            { isBookApproved: 'approved' }
          ] , returnStatus: 0,isdelete:0}, 
         include: [{
            model: bookModel,
            as: 'book', // Specify the alias here
            attributes: ['BookName','Image','BookPdf'] // Include attributes from BookModel
         },{
            model:userModel,
            as:'user',
            attributes:['name']
         }],
         raw: true, nest: true
      });
     
   }
   // console.log(totalBook,"klklkl")
   console.log(issuesBookResult,"issues")

   // const issuesBook= await BookRequestModel.findAndCountAll({where:{isBookApproved:'approved',returnStatus:0},include: [{
   //    model: bookModel,
   //    attributes: ["id", "BookName"],
   //  }]})   ;
   // // console.log(issuesBookResult.rows[0].book.Image);
     const totalBookResult= {
         count:totalBook.count,
         rows:totalBook.rows.map(object=>({
            Author:object?.Author,
            Availability:object?.Availability,
            BookName:object?.BookName,
            Description:object?.Description,
            Image:object?.Image,
            Price:object?.Price,
            Publisher:object?.Publisher,
            Remaining_Quantity:object?.Remaining_Quantity,
            TotalQuantity:object?.TotalQuantity,
            category:object?.category?.categoryName,
            categoryId:object?.category?.id,
            createdAt:object?.createdAt,
            id:object?.id,
            isdeleted:object?.isdeleted,
            updatedAt:object?.updatedAt
         }))
    }
   const totalUser = await userModel.findAndCountAll({ where: { roles: 'user' } });
   const returnBookResult={
      count:returnBook.count,
      rows:returnBook.rows.map(item =>({
         id:item?.id,
         userId:item?.userId,
         bookId:item?.bookId,
         Image:item?.book?.Image,
         startDate:item?.startDate,
         endDate:item?.endDate,
         bookName:item?.book?.BookName,
         isBookApproved:item?.isBookApproved,
         returnStatus:item?.returnBookResult,
         username:item?.user?.name
         
      }))
   }
   // console.log(returnBookResult)
   const issueBook = {  
   count: issuesBookResult.count,
        rows: issuesBookResult.rows.map(issue => ({
            id: issue?.id,
            userId: issue?.userId,
            bookId: issue?.bookId,
            isBookApproved: issue?.isBookApproved,
            startDate: issue?.startDate,
            endDate: issue?.endDate,
            returnStatus: issue?.returnStatus,
            Day:issue?.Day,
            BookName: issue?.book?.BookName,
            Image:issue?.book?.Image,
            BookPdf:issue?.book?.BookPdf,
            userName:issue?.user?.name
        }))
    };
    console.log(issueBook);
   // console.log(issueBook,"lllllll")
   // const books = issuesBook.rows.map(issue => ({
   //    id: issue.id, // Assuming issue.id is from BookRequestModel
   //    bookName: issue.Book ? issue.Book.BookName : null // Accessing BookName through the alias
   // }));
   // console.log(books)
   if (!totalBook || !availableBook || !returnBookResult || !issueBook || !totalUser) {

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
      totalBook: totalBookResult,
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

//show all requested book by user
exports.showRequested=catchAsync(async(req,res)=>{
    const requestdBook= await BookRequestModel.findAll({where:{isBookApproved:'pending',isdelete:0},include:[{model:BookModel, as:'book',attributes:['Image','BookName']},{model:userModel,as:'user',attributes:['name']}]});
    console.log(requestdBook,"89")
    if(!requestdBook){
      return res.status(400).json({
         error:true,
         statusCode:400,
         message:' Current not requested any book ',
      
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

//All order given by user
exports.Myorder=catchAsync(async (req,res)=>{
        const useId=req.user;
        const myOrder= await BookRequestModel.findAll({where:{userId:useId,isdelete:0},include:[{model:BookModel, as:'book',attributes:['Image','BookName']},{model:userModel,as:'user',attributes:['name']}]});
        if(!myOrder.length>0){
         return res.status(400).json({
            error:true,
            statusCode:400,
            message:'user not given by Order',

         })
        }
        else{
            const orders={
               rows:myOrder.map((order)=>({
                  Day:order.Day,
                  bookName:order.book.BookName,
                  Image:order.book.Image,
                  bookId:order.bookId,
                  endDate:order.endDate,
                  startDate:order.startDate,
                  isdelete:order.isdelete,
                  returnStatus:order.returnStatus ,
                  userId:order.userId,
                  username:order.user.name,
                  id:order.id,
                  isBookApproved:order.isBookApproved
               }))
            }
           return res.status(200).json({
            error:false,
            statusCode:200,
            message:'get order by user',
            data:orders
           })
        }
})                 

exports.extendDay=catchAsync(async(req,res)=>{

      const {bookId,userId,endDate}=req.body;

       if(!bookId || !userId || !endDate){
         return res.status(400).json({
              statusCode:400,
              error:true,
              message:"All filed are required",
      
         })
       }
       else{
           const extendedBook= await BookRequestModel.findOne({where:{bookId:bookId,userId:userId}});

           if(!extendedBook){
              return res.status(404).json({
               error:true,
               statusCode:404,
               message:'book not found'
              })
           }
           else{
             
            const updateEndDate= await BookRequestModel.update({endDate:endDate},{where:{bookId:bookId,userId:userId}})

           if(!updateEndDate){
            return res.status(400).json({
               error:true,
               statusCode:400,
               message:"endDate is not updated"
            })
           }
           else{
               return res.status(200).json({
                  error:false,
                  statusCode:200,
                  message:"succeessfully update endDate",
                  data:updateEndDate
               })
           }
           
           }
       }

})

// hook allow in function componets to access the state.
//virtual dom  which lightwight of dom easier  manuplation on that
