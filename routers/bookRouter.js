const express=require('express');
const router= express.Router();
const bookController=require('./../controllers/bookController');
const upload=require('./../utils/multer');
const validateSchema=require('./../utils/validateSchema');
const validate=require('./../middleware/validationMiddleware');
const authMiddleware=require('./../middleware/authMiddleware');
const {checkRole}= require('./../middleware/checkRoleMiddleware');

router.post('/createBook',validate(validateSchema.AddBookSchema),upload.single('Image'),bookController.createBook)
router.get('/getAll',authMiddleware,checkRole(['admin','user']),bookController.getAll);
router.get('/getOne/:id',authMiddleware,checkRole(['admin','user']),bookController.getOne);
router.put('/updateBook/:id',authMiddleware,checkRole('admin'),bookController.updateBook);        
router.delete('/deleteOne/:bookId',authMiddleware,checkRole('admin'),bookController.deleteOne);
router.delete('/deleteAll',authMiddleware,checkRole('admin'),bookController.deleteAll);
router.post('/updateQuantity',authMiddleware,checkRole('admin'),bookController.AssignedBookToUser);
router.post('/addRequest',authMiddleware,checkRole('user'),bookController.RequestForBook)
router.post('/returnDate',authMiddleware,checkRole('user'),bookController.returnBook)
router.get('/count',authMiddleware,bookController.count)
router.get('/search/:Category',validate(validateSchema.categoryName),authMiddleware,checkRole('user'),bookController.search)
router.get('/search/:BookName',validate(validateSchema.bookName),authMiddleware,checkRole('user'),bookController.searchBookByName)
router.get('/showRequested',authMiddleware,checkRole('admin'),bookController.showRequested);
router.get('/myOrder',authMiddleware,checkRole('user'),bookController.Myorder)
router.post('/extendDate',authMiddleware,checkRole('user'),bookController.extendDay)

module.exports=router; 