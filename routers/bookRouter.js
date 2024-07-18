const express=require('express');
const router= express.Router();
const bookController=require('./../controllers/bookController');
const upload=require('./../utils/multer');
const validateSchema=require('./../utils/validateSchema');
const validate=require('./../middleware/validationMiddleware');
const authMiddleware=require('./../middleware/authMiddleware');
const {checkRole}= require('./../middleware/checkRoleMiddleware');

router.post('/createBook',upload.single('Image'),bookController.createBook)
router.get('/getAll',bookController.getAll);
router.get('/getOne/:id',bookController.getOne);
router.put('/updateBook/:id',authMiddleware,checkRole('admin'),bookController.updateBook);        
router.delete('/deleteOne/:bookId',bookController.deleteOne);
router.delete('/deleteAll',bookController.deleteAll);
router.post('/updateQuantity',authMiddleware,checkRole('admin'),bookController.AssignedBookToUser);
router.post('/addRequest',authMiddleware,checkRole('user'),bookController.RequestForBook)
router.post('/returnDate',bookController.returnBook)
router.get('/count',authMiddleware,bookController.count)
router.get('/search/:Category',bookController.search)
router.get('/search/:BookName',bookController.searchBookByName)
router.get('/showRequested',bookController.showRequested);

module.exports=router; 