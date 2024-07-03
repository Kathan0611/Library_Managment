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
router.put('/updateBook/:id',bookController.updateBook);        
router.delete('/deleteOne/:id',bookController.deleteOne);
router.delete('/deleteAll',bookController.deleteAll);
router.post('/updateQuantity',authMiddleware,checkRole('admin'),bookController.AssignedBookToUser);
router.get('/addRequest/:BookId',authMiddleware,bookController.RequestForBook)
router.post('/returnDate',bookController.returnBook)
router.get('/count',authMiddleware,checkRole('admin'),bookController.count)
          

module.exports=router;