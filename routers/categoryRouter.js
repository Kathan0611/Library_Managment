const express=require('express');
const router= express.Router();
const categoryController=require('./../controllers/CategoryController');
const upload=require('./../utils/multer');
const validateSchema=require('./../utils/validateSchema');
const validate=require('./../middleware/validationMiddleware');
const authMiddleware=require('./../middleware/authMiddleware');
 const {checkRole}=require('./../middleware/checkRoleMiddleware')   

router.post('/createOne',validate(validateSchema.categoryName),categoryController.createCategory);
router.get('/getAll',authMiddleware,checkRole(['admin','user']),categoryController.categoryWiseBook);
router.get('/getOne/:id',categoryController.singleCategory);
router.put('/updateOne/:id',categoryController.updateCategory)
router.delete('/deleteOne/:id',authMiddleware,checkRole('admin'),categoryController.deleteCategory);
router.delete('/deleteAll',categoryController.destroyAllCategory);
router.get('/getAllCategory',categoryController.getAllCategory)


module.exports=router;
